import mongoose from 'mongoose'

const MAX_SUBJECT_NAME_LENGTH = 100

// Topics live nested under each subject (not as a separate flat array) so
// syllabus content stays tied to the subject it belongs to — this is what
// the future AI planner will need to generate a per-subject schedule.
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: MAX_SUBJECT_NAME_LENGTH,
    },
    topics: {
      type: [String],
      default: [],
    },
  },
  { timestamps: false },
)

const studyPlanSchema = new mongoose.Schema(
  {
    // One study plan per user for this phase — a person builds a single
    // plan for their upcoming exam(s), not multiple parallel plans.
    // Enforced at the database level via the unique index below.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    examDate: {
      type: Date,
      default: null,
    },
    subjects: {
      type: [subjectSchema],
      default: [],
    },
    // Hours per day the person has available to study.
    availableStudyHours: {
      type: Number,
      default: null,
      min: [0, 'availableStudyHours cannot be negative'],
    },
    // Populated by the AI Study Planner feature, not implemented in this
    // phase. Shape is intentionally open (Mixed) since the generated
    // schedule's structure hasn't been designed yet, and is never set
    // from client input in this phase's controller.
    generatedSchedule: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
)

studyPlanSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema)
