import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import logger from './utils/logger'

// Import routes
import authRoutes from './routes/auth.routes'
import vehicleRoutes from './routes/vehicle.routes'
import userRoutes from './routes/user.routes'
import transactionRoutes from './routes/transaction.routes'
import financeRoutes from './routes/finance.routes'
import messageRoutes from './routes/message.routes'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/vehicles', vehicleRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/finance', financeRoutes)
app.use('/api/v1/messages', messageRoutes)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

export default app
