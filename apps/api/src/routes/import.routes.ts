import { Router, Response } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { ScraperService } from '../services/scraper.service'
import { pool } from '../db/config'

const router = Router()

const scrapeSchema = Joi.object({
  url: Joi.string().uri().required(),
  dealerName: Joi.string().max(200).optional().allow(''),
})

const confirmSchema = Joi.object({
  vehicles: Joi.array().items(
    Joi.object({
      make: Joi.string().required(),
      model: Joi.string().allow('').default(''),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 2)
        .allow(null).default(new Date().getFullYear()),
      price: Joi.number().min(0).allow(null).default(0),
      currency: Joi.string().default('GBP'),
      mileage: Joi.number().min(0).allow(null).default(0),
      fuelType: Joi.string().allow(null, '').default('PETROL'),
      transmission: Joi.string().allow(null, '').default('MANUAL'),
      color: Joi.string().allow(null, '').default(''),
      engineSize: Joi.string().allow(null, '').default(''),
      description: Joi.string().allow(null, '').default(''),
      images: Joi.array().items(Joi.string()).default([]),
      sourceUrl: Joi.string().allow('').default(''),
    })
  ).min(1).required(),
})

// POST /api/v1/import/scrape
router.post('/scrape', authenticate, validate(scrapeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body
    const { vehicles, warning } = await ScraperService.scrapeUrl(url)
    res.json({
      status: 'success',
      data: { vehicles, count: vehicles.length, warning: warning || null },
    })
  } catch (err: any) {
    res.status(400).json({ status: 'error', message: err.message })
  }
})

// POST /api/v1/import/confirm
// Creates selected vehicles as DRAFT listings
router.post('/confirm', authenticate, validate(confirmSchema), async (req: AuthRequest, res: Response) => {
  const sellerId = req.user!.id
  const { vehicles } = req.body

  const created: string[] = []
  const failed: string[] = []

  for (const v of vehicles) {
    try {
      const result = await pool.query(
        `INSERT INTO vehicles
           (seller_id, make, model, year, vin, price, currency,
            mileage, condition, fuel_type, transmission, engine_size,
            color, description, features, images, status,
            location_city, location_state, location_country, location_zip_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'USED',$9,$10,$11,$12,$13,
                 ARRAY[]::text[], $14, 'DRAFT', '','','United Kingdom','')
         RETURNING id`,
        [
          sellerId,
          v.make, v.model, v.year,
          '',                              // vin — unknown
          v.price, v.currency,
          v.mileage || 0,
          v.fuelType || 'PETROL',
          v.transmission || 'MANUAL',
          v.engineSize || '',
          v.color || '',
          v.description || `${v.year} ${v.make} ${v.model} — imported from ${v.sourceUrl || 'external listing'}`,
          v.images || [],
        ]
      )
      created.push(result.rows[0].id)
    } catch (err) {
      console.error('Failed to import vehicle:', v.make, v.model, err)
      failed.push(`${v.year} ${v.make} ${v.model}`)
    }
  }

  res.json({
    status: 'success',
    data: {
      created: created.length,
      failed: failed.length,
      failedVehicles: failed,
      vehicleIds: created,
    },
  })
})

export default router
