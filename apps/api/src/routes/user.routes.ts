import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { VehicleService } from '../services/vehicle.service'
import { AuthService } from '../services/auth.service'

const router = Router()

/**
 * GET /api/v1/users/profile
 * Get current user profile
 */
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await AuthService.getUserById(req.user!.id)

    res.status(200).json({
      status: 'success',
      data: { user },
    })
  } catch (error: any) {
    res.status(404).json({
      status: 'error',
      message: error.message || 'User not found',
    })
  }
})

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
router.put('/profile', authenticate, (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Update user profile - to be implemented' })
})

/**
 * GET /api/v1/users/listings
 * Get current user's vehicle listings
 */
router.get('/listings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await VehicleService.getVehiclesBySeller(req.user!.id)

    res.status(200).json({
      status: 'success',
      data: { vehicles },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch user listings',
    })
  }
})

export default router
