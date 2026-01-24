import { Router } from 'express'

const router = Router()

// Placeholder routes - to be implemented
router.post('/applications', (req, res) => {
  res.status(501).json({ message: 'Submit finance application - to be implemented' })
})

router.get('/applications/:id', (req, res) => {
  res.status(501).json({ message: 'Get finance application - to be implemented' })
})

router.put('/applications/:id/review', (req, res) => {
  res.status(501).json({ message: 'Review finance application - to be implemented' })
})

router.get('/loans', (req, res) => {
  res.status(501).json({ message: 'Get user loans - to be implemented' })
})

export default router
