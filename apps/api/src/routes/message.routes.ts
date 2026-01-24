import { Router } from 'express'

const router = Router()

// Placeholder routes - to be implemented
router.get('/conversations', (req, res) => {
  res.status(501).json({ message: 'Get conversations - to be implemented' })
})

router.get('/conversations/:id', (req, res) => {
  res.status(501).json({ message: 'Get conversation messages - to be implemented' })
})

router.post('/conversations/:id/messages', (req, res) => {
  res.status(501).json({ message: 'Send message - to be implemented' })
})

export default router
