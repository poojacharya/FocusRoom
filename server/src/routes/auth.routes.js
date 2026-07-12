import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, refresh, logout } from '../controllers/auth.controller.js'
import { validateRegisterInput, validateLoginInput } from '../middleware/validateAuth.js'

const router = Router()

// Tighter than the global /api limiter (300/15min) specifically for the
// two credential-guessing endpoints. Doesn't apply to /refresh or /logout
// so normal token-refresh traffic isn't affected.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.',
})

router.post('/register', authLimiter, validateRegisterInput, register)
router.post('/login', authLimiter, validateLoginInput, login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
