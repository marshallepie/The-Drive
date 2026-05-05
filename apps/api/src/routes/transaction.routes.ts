import { Router, Response } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { TransactionService } from '../services/transaction.service'

const router = Router()

const initiateSchema = Joi.object({
  vehicleId: Joi.string().uuid().required(),
})

// POST /api/v1/transactions/initiate
router.post(
  '/initiate',
  authenticate,
  validate(initiateSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'
      const result = await TransactionService.initiate(
        req.user!.id,
        req.body.vehicleId,
        frontendUrl as string
      )
      res.status(201).json({ status: 'success', data: result })
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404
        : err.message.includes('not available') || err.message.includes('own listing') || err.message.includes('already in progress') ? 400
        : 500
      res.status(status).json({ status: 'error', message: err.message })
    }
  }
)

// GET /api/v1/transactions  — list user's transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await TransactionService.getUserTransactions(req.user!.id)
    res.json({ status: 'success', data: { transactions } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to load transactions' })
  }
})

// GET /api/v1/transactions/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tx = await TransactionService.getTransaction(req.params.id, req.user!.id)
    if (!tx) return res.status(404).json({ status: 'error', message: 'Transaction not found' })
    res.json({ status: 'success', data: { transaction: tx } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to load transaction' })
  }
})

// POST /api/v1/transactions/:id/confirm
router.post('/:id/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await TransactionService.confirmReceipt(req.params.id, req.user!.id)
    res.json({ status: 'success', message: 'Transaction completed' })
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Only the buyer') || err.message.includes('Cannot confirm') ? 403
      : 500
    res.status(status).json({ status: 'error', message: err.message })
  }
})

// POST /api/v1/transactions/:id/cancel
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await TransactionService.cancelTransaction(req.params.id, req.user!.id)
    res.json({ status: 'success', message: 'Transaction cancelled' })
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Cannot cancel') ? 400
      : 500
    res.status(status).json({ status: 'error', message: err.message })
  }
})

// POST /api/v1/transactions/webhook/stripe
router.post('/webhook/stripe', async (req: any, res: Response) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_TRANSACTION_WEBHOOK_SECRET

  if (!webhookSecret || !sig) {
    return res.status(400).json({ status: 'error', message: 'Webhook not configured' })
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string }
      await TransactionService.activateFromWebhook(intent.id)
    }

    res.json({ received: true })
  } catch (err: any) {
    console.error('Transaction webhook error:', err.message)
    res.status(400).json({ status: 'error', message: err.message })
  }
})

export default router
