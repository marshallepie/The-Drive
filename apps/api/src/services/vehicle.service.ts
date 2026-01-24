import { pool } from '../db/config'
import { VehicleSearchFilters } from '@drive/shared'

export class VehicleService {
  /**
   * Get all vehicles with optional filters and pagination
   */
  static async getVehicles(filters: VehicleSearchFilters = {}) {
    const {
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      condition,
      fuelType,
      transmission,
      maxMileage,
      location,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters

    const offset = (page - 1) * limit

    // Build WHERE clause
    const conditions: string[] = ["status = 'LIVE'"]
    const params: any[] = []
    let paramIndex = 1

    if (make) {
      conditions.push(`LOWER(make) = LOWER($${paramIndex})`)
      params.push(make)
      paramIndex++
    }

    if (model) {
      conditions.push(`LOWER(model) LIKE LOWER($${paramIndex})`)
      params.push(`%${model}%`)
      paramIndex++
    }

    if (minYear) {
      conditions.push(`year >= $${paramIndex}`)
      params.push(minYear)
      paramIndex++
    }

    if (maxYear) {
      conditions.push(`year <= $${paramIndex}`)
      params.push(maxYear)
      paramIndex++
    }

    if (minPrice) {
      conditions.push(`price >= $${paramIndex}`)
      params.push(minPrice)
      paramIndex++
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramIndex}`)
      params.push(maxPrice)
      paramIndex++
    }

    if (condition) {
      conditions.push(`condition = $${paramIndex}`)
      params.push(condition)
      paramIndex++
    }

    if (fuelType) {
      conditions.push(`fuel_type = $${paramIndex}`)
      params.push(fuelType)
      paramIndex++
    }

    if (transmission) {
      conditions.push(`transmission = $${paramIndex}`)
      params.push(transmission)
      paramIndex++
    }

    if (maxMileage) {
      conditions.push(`mileage <= $${paramIndex}`)
      params.push(maxMileage)
      paramIndex++
    }

    if (location) {
      conditions.push(`(LOWER(location_city) LIKE LOWER($${paramIndex}) OR LOWER(location_state) LIKE LOWER($${paramIndex}))`)
      params.push(`%${location}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['price', 'year', 'mileage', 'created_at']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM vehicles ${whereClause}`
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0].count)

    // Get vehicles with seller info
    const query = `
      SELECT
        v.*,
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'role', u.role,
          'dealershipName', u.dealership_name
        ) as seller
      FROM vehicles v
      JOIN users u ON v.seller_id = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    params.push(limit, offset)
    const result = await pool.query(query, params)

    return {
      vehicles: result.rows.map(this.formatVehicle),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Get vehicle by ID
   */
  static async getVehicleById(id: string) {
    const result = await pool.query(
      `SELECT
        v.*,
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'phone', u.phone,
          'role', u.role,
          'dealershipName', u.dealership_name,
          'dealershipLicense', u.dealership_license
        ) as seller
      FROM vehicles v
      JOIN users u ON v.seller_id = u.id
      WHERE v.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new Error('Vehicle not found')
    }

    return this.formatVehicle(result.rows[0])
  }

  /**
   * Create new vehicle listing
   */
  static async createVehicle(sellerId: string, vehicleData: any) {
    const {
      make,
      model,
      year,
      vin,
      condition,
      mileage,
      price,
      currency = 'USD',
      fuelType,
      transmission,
      engineSize,
      color,
      description,
      features = [],
      images = [],
      locationCity,
      locationState,
      locationCountry,
      locationZipCode,
      status = 'DRAFT',
    } = vehicleData

    const result = await pool.query(
      `INSERT INTO vehicles (
        seller_id, make, model, year, vin, condition, mileage, price, currency,
        fuel_type, transmission, engine_size, color, description, features, images,
        location_city, location_state, location_country, location_zip_code, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        sellerId,
        make,
        model,
        year,
        vin,
        condition,
        mileage,
        price,
        currency,
        fuelType,
        transmission,
        engineSize,
        color,
        description,
        features,
        images,
        locationCity,
        locationState,
        locationCountry,
        locationZipCode,
        status,
      ]
    )

    return this.formatVehicle(result.rows[0])
  }

  /**
   * Update vehicle listing
   */
  static async updateVehicle(vehicleId: string, sellerId: string, vehicleData: any) {
    // Check if vehicle belongs to seller
    const checkResult = await pool.query('SELECT seller_id FROM vehicles WHERE id = $1', [vehicleId])

    if (checkResult.rows.length === 0) {
      throw new Error('Vehicle not found')
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only update your own vehicles')
    }

    const {
      make,
      model,
      year,
      condition,
      mileage,
      price,
      currency,
      fuelType,
      transmission,
      engineSize,
      color,
      description,
      features,
      images,
      locationCity,
      locationState,
      locationCountry,
      locationZipCode,
      status,
    } = vehicleData

    const result = await pool.query(
      `UPDATE vehicles SET
        make = COALESCE($1, make),
        model = COALESCE($2, model),
        year = COALESCE($3, year),
        condition = COALESCE($4, condition),
        mileage = COALESCE($5, mileage),
        price = COALESCE($6, price),
        currency = COALESCE($7, currency),
        fuel_type = COALESCE($8, fuel_type),
        transmission = COALESCE($9, transmission),
        engine_size = COALESCE($10, engine_size),
        color = COALESCE($11, color),
        description = COALESCE($12, description),
        features = COALESCE($13, features),
        images = COALESCE($14, images),
        location_city = COALESCE($15, location_city),
        location_state = COALESCE($16, location_state),
        location_country = COALESCE($17, location_country),
        location_zip_code = COALESCE($18, location_zip_code),
        status = COALESCE($19, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *`,
      [
        make,
        model,
        year,
        condition,
        mileage,
        price,
        currency,
        fuelType,
        transmission,
        engineSize,
        color,
        description,
        features,
        images,
        locationCity,
        locationState,
        locationCountry,
        locationZipCode,
        status,
        vehicleId,
      ]
    )

    return this.formatVehicle(result.rows[0])
  }

  /**
   * Delete vehicle listing
   */
  static async deleteVehicle(vehicleId: string, sellerId: string) {
    // Check if vehicle belongs to seller
    const checkResult = await pool.query('SELECT seller_id FROM vehicles WHERE id = $1', [vehicleId])

    if (checkResult.rows.length === 0) {
      throw new Error('Vehicle not found')
    }

    if (checkResult.rows[0].seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only delete your own vehicles')
    }

    await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId])

    return { message: 'Vehicle deleted successfully' }
  }

  /**
   * Get vehicles by seller ID
   */
  static async getVehiclesBySeller(sellerId: string) {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE seller_id = $1 ORDER BY created_at DESC`,
      [sellerId]
    )

    return result.rows.map(this.formatVehicle)
  }

  /**
   * Format vehicle data from database
   */
  private static formatVehicle(row: any) {
    return {
      id: row.id,
      sellerId: row.seller_id,
      seller: row.seller,
      status: row.status,
      make: row.make,
      model: row.model,
      year: row.year,
      vin: row.vin,
      condition: row.condition,
      mileage: row.mileage,
      price: parseFloat(row.price),
      currency: row.currency,
      fuelType: row.fuel_type,
      transmission: row.transmission,
      engineSize: row.engine_size,
      color: row.color,
      description: row.description,
      features: row.features || [],
      images: row.images || [],
      location: {
        city: row.location_city,
        state: row.location_state,
        country: row.location_country,
        zipCode: row.location_zip_code,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
