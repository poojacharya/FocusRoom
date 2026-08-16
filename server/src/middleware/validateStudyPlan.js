import { ApiError } from '../utils/ApiError.js'

const MAX_SUBJECT_NAME_LENGTH = 100
const MAX_TOPIC_LENGTH = 200
const MAX_SUBJECTS = 50
const MAX_TOPICS_PER_SUBJECT = 100

function validateSubjects(subjects) {
  const errors = []

  if (!Array.isArray(subjects)) {
    errors.push('Subjects must be a list')
    return errors
  }
  if (subjects.length > MAX_SUBJECTS) {
    errors.push(`Subjects must be ${MAX_SUBJECTS} or fewer`)
  }

  subjects.forEach((subject, index) => {
    if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
      errors.push(`Subject at index ${index} must be an object`)
      return
    }
    if (!subject.name || typeof subject.name !== 'string' || !subject.name.trim()) {
      errors.push(`Subject at index ${index} requires a name`)
    } else if (subject.name.length > MAX_SUBJECT_NAME_LENGTH) {
      errors.push(`Subject name at index ${index} must be ${MAX_SUBJECT_NAME_LENGTH} characters or fewer`)
    }
    if (subject.topics !== undefined) {
      if (!Array.isArray(subject.topics) || subject.topics.some((topic) => typeof topic !== 'string')) {
        errors.push(`Topics for subject at index ${index} must be a list of text values`)
      } else if (subject.topics.length > MAX_TOPICS_PER_SUBJECT) {
        errors.push(`Topics for subject at index ${index} must be ${MAX_TOPICS_PER_SUBJECT} or fewer`)
      } else if (subject.topics.some((topic) => topic.length > MAX_TOPIC_LENGTH)) {
        errors.push(`Each topic for subject at index ${index} must be ${MAX_TOPIC_LENGTH} characters or fewer`)
      }
    }
  })

  return errors
}

function validateSharedFields({ examDate, subjects, availableStudyHours }) {
  const errors = []

  if (examDate !== undefined && examDate !== null && Number.isNaN(new Date(examDate).getTime())) {
    errors.push('examDate must be a valid date')
  }
  if (subjects !== undefined) {
    errors.push(...validateSubjects(subjects))
  }
  if (
    availableStudyHours !== undefined &&
    availableStudyHours !== null &&
    (typeof availableStudyHours !== 'number' || !Number.isFinite(availableStudyHours) || availableStudyHours < 0)
  ) {
    errors.push('availableStudyHours must be a non-negative number')
  }

  return errors
}

export function validateCreateStudyPlan(req, res, next) {
  const errors = validateSharedFields(req.body)
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}

export function validateUpdateStudyPlan(req, res, next) {
  const { examDate, subjects, availableStudyHours } = req.body
  const noFieldsProvided = examDate === undefined && subjects === undefined && availableStudyHours === undefined

  const errors = validateSharedFields(req.body)
  if (noFieldsProvided) errors.push('Provide at least one field to update')
  if (errors.length > 0) return next(new ApiError(400, 'Validation failed', errors))
  next()
}
