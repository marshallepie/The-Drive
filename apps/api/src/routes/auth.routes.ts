import { Router, Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { validate } from '../middleware/validate.middleware'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator'

const router = Router()

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body)

    res.status(201).json({
      status: 'success',
      data: result,
    })
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Registration failed',
    })
  }
})

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body)

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Login failed',
    })
  }
})

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    const result = await AuthService.refreshToken(refreshToken)

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Token refresh failed',
    })
  }
})

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  // Since we're using JWT, logout is handled client-side
  // This endpoint can be used for logging or cleanup if needed
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  })
})

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
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
 * POST /api/v1/auth/wallet-auth
 * Wallet authentication (Web3) - to be implemented
 */
router.post('/wallet-auth', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Wallet authentication - to be implemented'
  })
})

export default router
