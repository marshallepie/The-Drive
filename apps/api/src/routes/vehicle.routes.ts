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

// Fuel type mapping from DVLA values to our enum
function mapFuelType(dvlaFuel: string): string {
  const f = dvlaFuel?.toUpperCase() || ''
  if (f.includes('ELECTRIC') && f.includes('PLUG')) return 'PLUG_IN_HYBRID'
  if (f.includes('ELECTRIC') && (f.includes('HYBRID') || f.includes('BI'))) return 'HYBRID'
  if (f === 'ELECTRIC') return 'ELECTRIC'
  if (f.includes('DIESEL')) return 'DIESEL'
  if (f.includes('PETROL') || f.includes('GASOLINE') || f.includes('GAS')) return 'PETROL'
  if (f.includes('HYBRID')) return 'HYBRID'
  return 'PETROL'
}

function formatEngineSize(cc: number): string {
  if (!cc || cc === 0) return ''
  const litres = (cc / 1000).toFixed(1)
  return `${litres}L`
}

/**
 * POST /api/v1/vehicles/lookup
 * Look up vehicle details from DVLA by registration plate
 */
router.post('/lookup', authenticate, async (req: Request, res: Response) => {
  const rawPlate = (req.body.registrationNumber || '').toString().toUpperCase().replace(/\s/g, '')

  if (!rawPlate || rawPlate.length < 2 || rawPlate.length > 8) {
    return res.status(400).json({ status: 'error', message: 'Invalid registration number' })
  }

  const apiKey = process.env.DVLA_API_KEY
  const testMode = !apiKey

  if (testMode) {
    // Return sample data so the UI works without a DVLA key
    return res.json({
      status: 'success',
      testMode: true,
      data: {
        registrationNumber: rawPlate,
        make: 'VOLKSWAGEN',
        yearOfManufacture: 2019,
        fuelType: 'DIESEL',
        mappedFuelType: 'DIESEL',
        colour: 'BLACK',
        engineCapacity: 1968,
        engineSize: '2.0L',
        motStatus: 'Valid',
        motExpiryDate: '2025-10-15',
        taxStatus: 'Taxed',
        taxDueDate: '2025-12-01',
        co2Emissions: 118,
      },
    })
  }

  try {
    const response = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationNumber: rawPlate }),
    })

    if (response.status === 404) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found — check the registration number' })
    }
    if (!response.ok) {
      return res.status(502).json({ status: 'error', message: 'DVLA lookup failed — please enter details manually' })
    }

    const dvla = await response.json() as any

    return res.json({
      status: 'success',
      testMode: false,
      data: {
        registrationNumber: dvla.registrationNumber,
        make: dvla.make ? (dvla.make.charAt(0).toUpperCase() + dvla.make.slice(1).toLowerCase()) : '',
        yearOfManufacture: dvla.yearOfManufacture || null,
        fuelType: dvla.fuelType || '',
        mappedFuelType: mapFuelType(dvla.fuelType || ''),
        colour: dvla.colour ? (dvla.colour.charAt(0).toUpperCase() + dvla.colour.slice(1).toLowerCase()) : '',
        engineCapacity: dvla.engineCapacity || 0,
        engineSize: formatEngineSize(dvla.engineCapacity || 0),
        motStatus: dvla.motStatus || null,
        motExpiryDate: dvla.motExpiryDate || null,
        taxStatus: dvla.taxStatus || null,
        taxDueDate: dvla.taxDueDate || null,
        co2Emissions: dvla.co2Emissions || null,
        euroStatus: dvla.euroStatus || null,
      },
    })
  } catch (err) {
    console.error('DVLA lookup error:', err)
    return res.status(502).json({ status: 'error', message: 'DVLA lookup failed — please enter details manually' })
  }
})

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
