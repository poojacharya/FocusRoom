import { ApiError } from '../utils/ApiError.js'

export function validateSendFriendRequest(req, res, next) {
  const { recipientId } = req.body
  const errors = []

  if (!recipientId || typeof recipientId !== 'string') {
    errors.push('recipientId is required')
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors))
  }

  next()
}
