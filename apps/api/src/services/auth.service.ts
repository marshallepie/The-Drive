import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/config'
import { UserRole } from '@drive/shared'

const SALT_ROUNDS = 10

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  phone?: string
}

interface LoginData {
  email: string
  password: string
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData) {
    const { email, password, firstName, lastName, role = 'PUBLIC', phone } = data

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, phone, wallet_address, kyc_status, is_active, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, role, phone]
    )

    const user = result.rows[0]

    // Generate tokens
    const tokens = this.generateTokens(user)

    return {
      user: this.sanitizeUser(user),
      tokens,
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginData) {
    const { email, password } = data

    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, phone,
              wallet_address, kyc_status, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password')
    }

    const user = result.rows[0]

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is disabled. Please contact support.')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const tokens = this.generateTokens(user)

    return {
      user: this.sanitizeUser(user),
      tokens,
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        id: string
        email: string
      }

      // Find user
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, role, phone,
                wallet_address, kyc_status, is_active, created_at
         FROM users
         WHERE id = $1 AND is_active = true`,
        [decoded.id]
      )

      if (result.rows.length === 0) {
        throw new Error('User not found')
      }

      const user = result.rows[0]

      // Generate new tokens
      const tokens = this.generateTokens(user)

      return {
        user: this.sanitizeUser(user),
        tokens,
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, phone,
              wallet_address, kyc_status, is_active, dealership_name,
              dealership_license, bank_institution, bio, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      throw new Error('User not found')
    }

    return this.sanitizeUser(result.rows[0])
  }

  /**
   * Generate JWT tokens
   */
  private static generateTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      }
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * Remove sensitive data from user object
   */
  private static sanitizeUser(user: any) {
    const { password_hash, ...sanitizedUser } = user
    return {
      ...sanitizedUser,
      firstName: user.first_name,
      lastName: user.last_name,
      walletAddress: user.wallet_address,
      kycStatus: user.kyc_status,
      isActive: user.is_active,
      dealershipName: user.dealership_name,
      dealershipLicense: user.dealership_license,
      bankInstitution: user.bank_institution,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }
  }
}
