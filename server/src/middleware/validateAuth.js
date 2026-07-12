import { ApiError } from '../utils/ApiError.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterInput(req, res, next) {
  const { name, email, password } = req.body
  const errors = []

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required')
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors))
  }

  next()
}

export function validateLoginInput(req, res, next) {
  const { email, password } = req.body
  const errors = []

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required')
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors))
  }

  next()
}
