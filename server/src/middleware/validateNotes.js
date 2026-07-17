import { ApiError } from '../utils/ApiError.js'

const MAX_TITLE_LENGTH = 200

function collectErrors({ title, body }, { requireOne = false } = {}) {
  const errors = []

  if (requireOne && title === undefined && body === undefined) {
    errors.push('Provide at least a title or body to update')
  }
  if (title !== undefined && typeof title !== 'string') {
    errors.push('Title must be text')
  }
  if (title !== undefined && title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`)
  }
  if (body !== undefined && typeof body !== 'string') {
    errors.push('Body must be text')
  }

  return errors
}

export function validateCreateNote(req, res, next) {
  const errors = collectErrors(req.body)
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}

export function validateUpdateNote(req, res, next) {
  const errors = collectErrors(req.body, { requireOne: true })
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}
