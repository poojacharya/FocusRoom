import { ApiError } from '../utils/ApiError.js'

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000
const PRIORITY_VALUES = ['low', 'medium', 'high']

function validateSharedFields({ title, description, priority, dueDate, tags, completed }) {
  const errors = []

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title cannot be empty')
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`)
    }
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be text')
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`)
    }
  }
  if (priority !== undefined && !PRIORITY_VALUES.includes(priority)) {
    errors.push(`Priority must be one of: ${PRIORITY_VALUES.join(', ')}`)
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(new Date(dueDate).getTime())) {
    errors.push('Due date must be a valid date')
  }
  if (tags !== undefined && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string'))) {
    errors.push('Tags must be a list of text values')
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Completed must be true or false')
  }

  return errors
}

export function validateCreateTask(req, res, next) {
  const errors = validateSharedFields(req.body)
  // Title is the one field that's mandatory on create. validateSharedFields
  // already flags an empty-string title ("Title cannot be empty"); this
  // only adds a message for the completely-missing case, so the two never
  // both fire for the same problem.
  if (req.body.title === undefined) {
    errors.unshift('Title is required')
  }
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}

export function validateUpdateTask(req, res, next) {
  const { title, description, priority, dueDate, tags, completed } = req.body
  const noFieldsProvided =
    title === undefined &&
    description === undefined &&
    priority === undefined &&
    dueDate === undefined &&
    tags === undefined &&
    completed === undefined

  const errors = validateSharedFields(req.body)
  if (noFieldsProvided) errors.push('Provide at least one field to update')
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}
