import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import routes from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sanitizeMongoInput } from './middleware/sanitizeMongoInput.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistPath = path.resolve(__dirname, '../../client/dist')

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean)

export function createApp() {
  const app = express()

  // --- Security & parsing middleware ---
  app.use(helmet())
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`CORS blocked for origin: ${origin}`))
      },
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

  // Serve the built Vite client for any GET request that doesn't target
  // the API or Socket.IO. This prevents browser reloads on routes like
  // /friends or /study-room from falling through to Express 404s.
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(clientDistPath))
    app.get(/^(?!\/api).*/, (req, res, next) => {
      if (req.path.startsWith('/socket.io')) return next()
      if (req.path.includes('.') || req.method !== 'GET') return next()
      res.sendFile(path.join(clientDistPath, 'index.html'))
    })
  }

  // --- 404 + error handling (must be last) ---
  app.use(notFound)
  app.use(errorHandler)

  return app
}
