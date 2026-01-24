import { Router, Request, Response } from 'express'
import { VehicleService } from '../services/vehicle.service'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleSearchSchema,
} from '../validators/vehicle.validator'

const router = Router()

/**
 * GET /api/v1/vehicles
 * Get all vehicles with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = vehicleSearchSchema.validate(req.query, { stripUnknown: true })

    if (filters.error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: filters.error.details,
      })
    }

    const result = await VehicleService.getVehicles(filters.value)

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch vehicles',
    })
  }
})

/**
 * GET /api/v1/vehicles/:id
 * Get vehicle by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: { vehicle },
    })
  } catch (error: any) {
    res.status(404).json({
      status: 'error',
      message: error.message || 'Vehicle not found',
    })
  }
})

/**
 * POST /api/v1/vehicles
 * Create new vehicle listing (requires authentication)
 */
router.post(
  '/',
  authenticate,
  validate(createVehicleSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const vehicle = await VehicleService.createVehicle(req.user!.id, req.body)

      res.status(201).json({
        status: 'success',
        data: { vehicle },
      })
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create vehicle',
      })
    }
  }
)

/**
 * PUT /api/v1/vehicles/:id
 * Update vehicle listing (requires authentication)
 */
router.put(
  '/:id',
  authenticate,
  validate(updateVehicleSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const vehicle = await VehicleService.updateVehicle(req.params.id, req.user!.id, req.body)

      res.status(200).json({
        status: 'success',
        data: { vehicle },
      })
    } catch (error: any) {
      const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 400

      res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update vehicle',
      })
    }
  }
)

/**
 * DELETE /api/v1/vehicles/:id
 * Delete vehicle listing (requires authentication)
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await VehicleService.deleteVehicle(req.params.id, req.user!.id)

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 400

    res.status(status).json({
      status: 'error',
      message: error.message || 'Failed to delete vehicle',
    })
  }
})

export default router
