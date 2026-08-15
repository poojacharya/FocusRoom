import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyRoom',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 2000,
    },
  },
  // Messages are never edited, so only createdAt is tracked — same
  // pattern as Friend's { createdAt: true } request timestamp.
  { timestamps: { createdAt: true, updatedAt: false } },
)

// Every read is "this room's messages, most recent first, capped to a
// history limit" (see listRoomMessages in studyRooms.controller.js) —
// this compound index serves that query directly.
chatMessageSchema.index({ room: 1, createdAt: -1 })

chatMessageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
