import Stripe from 'stripe'
import { pool } from '../db/config'
import { EmailService } from './email.service'

const ANNUAL_AMOUNT_GBP   = 600.00
const MONTHLY_AMOUNT_GBP  = 70.00
const REBATE_PER_SALE_GBP = 100.00
const MAX_REBATE_GBP      = 600.00

export class SubscriptionService {

  private static getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) return null
    return new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  static async getStatus(dealerId: string) {
    const result = await pool.query(
      `SELECT
         id, dealer_id, status,
         subscription_year_start, subscription_year_end,
         amount_paid, currency,
         rebate_earned, qualifying_sales,
         created_at, updated_at
       FROM dealer_subscriptions
       WHERE dealer_id = $1`,
      [dealerId]
    )
    return result.rows[0] || null
  }

  static async createCheckoutSession(
    dealerId: string,
    frontendUrl: string,
    plan: 'monthly' | 'annual' = 'annual'
  ) {
    const existing = await this.getStatus(dealerId)
    if (existing?.status === 'ACTIVE') {
      throw new Error('Dealer already has an active subscription')
    }

    const stripe = this.getStripe()

    // No Stripe configured — activate immediately in test mode
    if (!stripe) {
      await this.activateSubscription(dealerId, null, null, plan)
      return { url: null, testMode: true }
    }

    const isAnnual = plan === 'annual'
    const cancelUrl = `${frontendUrl}/subscription?plan=${plan}`

    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>

    if (isAnnual) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Drive Dealer Annual Membership',
              description: '12-month dealer access. £100 rebate per vehicle sold — sell 6 and the subscription is free.',
            },
            unit_amount: 60000,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: { dealerId, plan: 'annual' },
      })
    } else {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Drive Dealer Monthly Membership',
              description: 'Monthly dealer access to the Drive marketplace. Cancel anytime.',
            },
            unit_amount: 7000,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: { dealerId, plan: 'monthly' },
      })
    }

    await pool.query(
      `INSERT INTO dealer_subscriptions (dealer_id, status, stripe_checkout_session_id, plan)
       VALUES ($1, 'PENDING_PAYMENT', $2, $3)
       ON CONFLICT (dealer_id) DO UPDATE
         SET stripe_checkout_session_id = $2,
             plan = $3,
             status = 'PENDING_PAYMENT',
             updated_at = NOW()`,
      [dealerId, session.id, plan]
    )

    return { url: session.url, testMode: false }
  }

  private static async activateSubscription(
    dealerId: string,
    sessionId: string | null,
    paymentIntentId: string | null,
    planOverride?: 'monthly' | 'annual'
  ) {
    // Determine plan: use override, fall back to what's stored for this dealer
    let plan = planOverride
    if (!plan) {
      const existing = await pool.query(
        `SELECT plan FROM dealer_subscriptions WHERE dealer_id = $1`, [dealerId]
      )
      plan = existing.rows[0]?.plan || 'annual'
    }

    const now = new Date()
    const periodEnd = new Date(now)
    if (plan === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    const amountPaid = plan === 'monthly' ? MONTHLY_AMOUNT_GBP : ANNUAL_AMOUNT_GBP

    await pool.query(
      `INSERT INTO dealer_subscriptions
         (dealer_id, status, plan, subscription_year_start, subscription_year_end,
          amount_paid, stripe_checkout_session_id, stripe_payment_intent_id)
       VALUES ($1, 'ACTIVE', $2, $3, $4, $5, $6, $7)
       ON CONFLICT (dealer_id) DO UPDATE
         SET status = 'ACTIVE',
             plan   = $2,
             subscription_year_start = $3,
             subscription_year_end   = $4,
             amount_paid             = $5,
             stripe_checkout_session_id  = COALESCE($6, dealer_subscriptions.stripe_checkout_session_id),
             stripe_payment_intent_id    = COALESCE($7, dealer_subscriptions.stripe_payment_intent_id),
             updated_at = NOW()`,
      [dealerId, plan, now, periodEnd, amountPaid, sessionId, paymentIntentId]
    )
  }

  static async activateFromWebhook(sessionId: string, paymentIntentId: string) {
    const result = await pool.query(
      `SELECT dealer_id FROM dealer_subscriptions
       WHERE stripe_checkout_session_id = $1`,
      [sessionId]
    )
    if (result.rows.length === 0) return

    const dealerId = result.rows[0].dealer_id
    await this.activateSubscription(dealerId, sessionId, paymentIntentId)
    await this.sendActivationEmail(dealerId)
  }

  static async activateManually(dealerId: string) {
    await this.activateSubscription(dealerId, null, null)
    await this.sendActivationEmail(dealerId)
  }

  private static async sendActivationEmail(dealerId: string) {
    const res = await pool.query(
      `SELECT email, first_name, dealership_name FROM users WHERE id = $1`,
      [dealerId]
    )
    if (res.rows.length === 0) return
    const { email, first_name, dealership_name } = res.rows[0]
    EmailService.sendSubscriptionActivated(email, first_name, dealership_name || undefined).catch(() => {})
  }

  // Called when a vehicle sale completes via escrow — credits £100 rebate
  static async creditRebate(dealerId: string) {
    const sub = await this.getStatus(dealerId)
    if (!sub || sub.status !== 'ACTIVE') return

    const current = parseFloat(sub.rebate_earned)
    if (current >= MAX_REBATE_GBP) return // Already capped at £600

    const newRebate = Math.min(current + REBATE_PER_SALE_GBP, MAX_REBATE_GBP)

    await pool.query(
      `UPDATE dealer_subscriptions
       SET rebate_earned     = $1,
           qualifying_sales  = qualifying_sales + 1,
           updated_at        = NOW()
       WHERE dealer_id = $2`,
      [newRebate, dealerId]
    )
  }
}
