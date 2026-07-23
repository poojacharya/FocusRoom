import mongoose from 'mongoose'

const PRIORITY_VALUES = ['low', 'medium', 'high']

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: PRIORITY_VALUES,
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

// Every list view is "this user's tasks, newest first" by default — the
// frontend re-sorts client-side for due date / priority (see
// lib/utils/taskSort.js), same no-pagination scale assumption already
// established for Notes in Phase 3A.
taskSchema.index({ owner: 1, createdAt: -1 })

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const Task = mongoose.model('Task', taskSchema)
