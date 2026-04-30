import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { SubscriptionService } from '../services/subscription.service'
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../types'

const router = Router()

/**
 * GET /api/v1/subscriptions/status
 * Returns the dealer's current subscription record
 */
router.get(
  '/status',
  authenticate,
  authorize(UserRole.DEALER),
  async (req: AuthRequest, res: Response) => {
    try {
      const subscription = await SubscriptionService.getStatus(req.user!.id)
      res.json({ status: 'success', data: { subscription } })
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message })
    }
  }
)

/**
 * POST /api/v1/subscriptions/checkout
 * Creates a Stripe Checkout session (or activates in test mode if Stripe not configured)
 */
router.post(
  '/checkout',
  authenticate,
  authorize(UserRole.DEALER),
  async (req: AuthRequest, res: Response) => {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const result = await SubscriptionService.createCheckoutSession(
        req.user!.id,
        frontendUrl
      )
      res.json({ status: 'success', data: result })
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message })
    }
  }
)

/**
 * POST /api/v1/subscriptions/webhook
 * Stripe webhook — activates subscription on successful payment
 * Uses raw body (set in index.ts) for signature verification
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(400).json({ status: 'error', message: 'Stripe not configured' })
  }

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ status: 'error', message: 'Webhook signature missing' })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { id: string; payment_intent: string | null }
      await SubscriptionService.activateFromWebhook(
        session.id,
        session.payment_intent ?? ''
      )
    }

    res.json({ received: true })
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message })
  }
})

/**
 * POST /api/v1/subscriptions/activate
 * Admin: manually activate a dealer subscription (for testing or offline payment)
 */
router.post(
  '/activate',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response) => {
    try {
      const { dealerId } = req.body
      if (!dealerId) throw new Error('dealerId is required')
      await SubscriptionService.activateManually(dealerId)
      res.json({ status: 'success', message: 'Subscription activated' })
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message })
    }
  }
)

export default router
