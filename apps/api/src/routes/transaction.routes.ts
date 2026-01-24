import { Router } from 'express'

const router = Router()

// Placeholder routes - to be implemented
router.post('/initiate', (req, res) => {
  res.status(501).json({ message: 'Initiate transaction - to be implemented' })
})

router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get transaction details - to be implemented' })
})

router.post('/:id/confirm', (req, res) => {
  res.status(501).json({ message: 'Confirm transaction - to be implemented' })
})

router.post('/webhook/stripe', (req, res) => {
  res.status(501).json({ message: 'Stripe webhook - to be implemented' })
})

export default router
