import { ApiError } from '../utils/ApiError.js'

const FOCUS_MODES = ['pomodoro', 'stopwatch', 'countdown']

function validateSharedFields({ mode, duration, startedAt, endedAt, completed }) {
  const errors = []

  if (mode !== undefined && !FOCUS_MODES.includes(mode)) {
    errors.push(`Mode must be one of: ${FOCUS_MODES.join(', ')}`)
  }
  if (duration !== undefined) {
    if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
      errors.push('Duration must be a positive number of seconds')
    }
  }
  if (startedAt !== undefined && Number.isNaN(new Date(startedAt).getTime())) {
    errors.push('startedAt must be a valid date')
  }
  if (endedAt !== undefined && Number.isNaN(new Date(endedAt).getTime())) {
    errors.push('endedAt must be a valid date')
  }
  if (
    startedAt !== undefined &&
    endedAt !== undefined &&
    !Number.isNaN(new Date(startedAt).getTime()) &&
    !Number.isNaN(new Date(endedAt).getTime()) &&
    new Date(endedAt).getTime() < new Date(startedAt).getTime()
  ) {
    errors.push('endedAt cannot be before startedAt')
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Completed must be true or false')
  }

  return errors
}

export function validateCreateFocusSession(req, res, next) {
  const { mode, duration, startedAt, endedAt } = req.body
  const errors = validateSharedFields(req.body)

  // Shared-field checks already flag a *malformed* mode/duration/date;
  // these only cover the completely-missing case, so the two never both
  // fire for the same field.
  if (mode === undefined) errors.unshift('Mode is required')
  if (duration === undefined) errors.push('Duration is required')
  if (startedAt === undefined) errors.push('startedAt is required')
  if (endedAt === undefined) errors.push('endedAt is required')

  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}

export function validateUpdateFocusSession(req, res, next) {
  const { mode, duration, startedAt, endedAt, completed } = req.body
  const noFieldsProvided =
    mode === undefined &&
    duration === undefined &&
    startedAt === undefined &&
    endedAt === undefined &&
    completed === undefined

  const errors = validateSharedFields(req.body)
  if (noFieldsProvided) errors.push('Provide at least one field to update')
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}
