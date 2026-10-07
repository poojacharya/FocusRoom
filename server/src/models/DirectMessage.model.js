import mongoose from 'mongoose'

const directMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })

directMessageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema)
