import mongoose from 'mongoose'

export const FOCUS_SESSION_MODES = ['pomodoro', 'stopwatch', 'countdown']

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mode: {
      type: String,
      enum: FOCUS_SESSION_MODES,
      required: [true, 'Mode is required'],
    },
    // Seconds. For pomodoro/countdown this is the session's target
    // duration (it's only ever saved once that target is reached, or the
    // person explicitly finishes early); for stopwatch it's the total
    // elapsed time when the session was finished. Either way, this is
    // always what actually elapsed — an abandoned pomodoro that gets
    // reset before completion is simply never saved, rather than saved
    // with a duration that doesn't match what really happened.
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    startedAt: {
      type: Date,
      required: [true, 'startedAt is required'],
    },
    endedAt: {
      type: Date,
      required: [true, 'endedAt is required'],
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Every list view is "this user's sessions, most recent first" — same
// pattern as Notes' { owner: 1, updatedAt: -1 } and Tasks'
// { owner: 1, createdAt: -1 } indexes, sorted on startedAt here since
// that's the timestamp that actually matters for a focus session.
focusSessionSchema.index({ user: 1, startedAt: -1 })

focusSessionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema)
