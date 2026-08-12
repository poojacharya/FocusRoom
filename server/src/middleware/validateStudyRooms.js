import { ApiError } from '../utils/ApiError.js'

const MAX_NAME_LENGTH = 100

export function validateCreateRoom(req, res, next) {
  const { name } = req.body
  const errors = []

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Room name is required')
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`Room name must be ${MAX_NAME_LENGTH} characters or fewer`)
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors))
  }
  next()
}

export function validateJoinRoom(req, res, next) {
  const { roomCode } = req.body
  const errors = []

  if (!roomCode || typeof roomCode !== 'string' || roomCode.trim().length === 0) {
    errors.push('Room code is required')
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors))
  }
  next()
}
