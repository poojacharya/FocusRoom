import mongoose from 'mongoose'
import crypto from 'crypto'

const ROOM_CODE_LENGTH = 6
// Excludes visually ambiguous characters (0/O, 1/I/L) so a code is easy
// to read aloud or retype correctly.
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const studyRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: 100,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Includes the owner — every room list/detail read is "rooms I'm a
    // member of", and the owner is always implicitly a member of their
    // own room, same as it would be in a real study room.
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

// "My rooms" is always "rooms I'm a member of, most recent first".
studyRoomSchema.index({ members: 1, createdAt: -1 })

studyRoomSchema.statics.generateRoomCode = function generateRoomCode() {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += ROOM_CODE_ALPHABET[crypto.randomInt(ROOM_CODE_ALPHABET.length)]
  }
  return code
}

studyRoomSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const StudyRoom = mongoose.model('StudyRoom', studyRoomSchema)
