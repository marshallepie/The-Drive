import { Router } from 'express'

const router = Router()

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(501).json({ message: 'List vehicles endpoint - to be implemented' })
})

router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get vehicle endpoint - to be implemented' })
})

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create vehicle listing - to be implemented' })
})

router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Update vehicle listing - to be implemented' })
})

router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Delete vehicle listing - to be implemented' })
})

export default router
