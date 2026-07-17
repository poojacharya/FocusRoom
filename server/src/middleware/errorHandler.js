import { ApiError } from '../utils/ApiError.js'

// The User model's unique email index (introduced by the Authentication
// feature) is the first unique constraint in the app. Without this, a
// registration race condition would surface as a raw, unhelpful Mongo
// duplicate-key error instead of a clean 409.
//
// Notes is the first feature where a client supplies a Mongo ObjectId
// directly in a route param (GET/PATCH/DELETE /api/notes/:id). If that
// param isn't a valid ObjectId shape, Mongoose throws a CastError before
// the query even runs — without handling it here, that surfaces as an
// opaque 500 instead of a clean 400.
function normalizeError(err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return new ApiError(409, `An account with this ${field} already exists`)
  }
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return new ApiError(400, 'Invalid id')
  }
  return err
}

export function errorHandler(rawErr, req, res, next) {
  const err = normalizeError(rawErr)
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  if (!err.isOperational) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational
      ? { stack: err.stack }
      : {}),
  })
}
