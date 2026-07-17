import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

// Every list view is "this user's notes, most recently edited first" —
// this compound index serves that query directly instead of sorting
// in memory after fetch.
noteSchema.index({ owner: 1, updatedAt: -1 })

noteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const Note = mongoose.model('Note', noteSchema)
