import Stripe from 'stripe'
import { pool } from '../db/config'
import { EmailService } from './email.service'

const SUBSCRIPTION_AMOUNT_GBP = 600.00
const REBATE_PER_SALE_GBP     = 100.00
const MAX_REBATE_GBP          = 600.00

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

  static async createCheckoutSession(dealerId: string, frontendUrl: string) {
    const existing = await this.getStatus(dealerId)
    if (existing?.status === 'ACTIVE') {
      throw new Error('Dealer already has an active subscription')
    }

    const stripe = this.getStripe()

    // No Stripe configured — activate immediately in test mode
    if (!stripe) {
      await this.activateSubscription(dealerId, null, null)
      return { url: null, testMode: true }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Drive Dealer Annual Subscription',
            description:
              '12-month dealer access. £100 rebate per vehicle sold — sell 6 cars and the subscription is free.',
          },
          unit_amount: 60000, // £600.00 in pence
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${frontendUrl}/subscription`,
      metadata: { dealerId },
    })

    await pool.query(
      `INSERT INTO dealer_subscriptions (dealer_id, status, stripe_checkout_session_id)
       VALUES ($1, 'PENDING_PAYMENT', $2)
       ON CONFLICT (dealer_id) DO UPDATE
         SET stripe_checkout_session_id = $2,
             status = 'PENDING_PAYMENT',
             updated_at = NOW()`,
      [dealerId, session.id]
    )

    return { url: session.url, testMode: false }
  }

  private static async activateSubscription(
    dealerId: string,
    sessionId: string | null,
    paymentIntentId: string | null
  ) {
    const now = new Date()
    const yearLater = new Date(now)
    yearLater.setFullYear(yearLater.getFullYear() + 1)

    await pool.query(
      `INSERT INTO dealer_subscriptions
         (dealer_id, status, subscription_year_start, subscription_year_end,
          stripe_checkout_session_id, stripe_payment_intent_id)
       VALUES ($1, 'ACTIVE', $2, $3, $4, $5)
       ON CONFLICT (dealer_id) DO UPDATE
         SET status = 'ACTIVE',
             subscription_year_start = $2,
             subscription_year_end   = $3,
             stripe_checkout_session_id  = COALESCE($4, dealer_subscriptions.stripe_checkout_session_id),
             stripe_payment_intent_id    = COALESCE($5, dealer_subscriptions.stripe_payment_intent_id),
             updated_at = NOW()`,
      [dealerId, now, yearLater, sessionId, paymentIntentId]
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
