import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import routes from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sanitizeMongoInput } from './middleware/sanitizeMongoInput.js'

export function createApp() {
  const app = express()

  // --- Security & parsing middleware ---
  app.use(helmet())
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())
  // express-mongo-sanitize@2.x reassigns req.query wholesale, which
  // throws on Express 4.21+ since req.query has no setter — that was
  // breaking every request (including register/login). Replaced with
  // an in-place sanitizer; see middleware/sanitizeMongoInput.js.
  app.use(sanitizeMongoInput)

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  }

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api', apiLimiter)

  // --- Routes ---
  app.use('/api', routes)

  // --- 404 + error handling (must be last) ---
  app.use(notFound)
  app.use(errorHandler)

  return app
}
