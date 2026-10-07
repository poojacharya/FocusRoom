import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 255 },
    type: { type: String, required: true, maxlength: 127 },
    data: { type: String, required: true },
  },
  { _id: false },
)

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
      default: '',
      maxlength: 2000,
    },
    attachments: { type: [attachmentSchema], default: [] },
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
