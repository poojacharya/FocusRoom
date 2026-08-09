import mongoose from 'mongoose'

/**
 * A single Friend document represents the relationship between exactly
 * two users, regardless of who initiated it. `userA`/`userB` are always
 * stored in a canonical order (the two ids compared as strings, smaller
 * first) rather than as "requester"/"recipient" — `requestedBy` carries
 * that directional information separately.
 *
 * This means a unique compound index on (userA, userB) is enough for
 * MongoDB itself to guarantee only one relationship document can ever
 * exist between any two users, in either direction, even under a race
 * (e.g. both people click "Add friend" on each other at the same
 * moment) — no read-modify-write check can be raced around it, the same
 * atomic-operation principle already used for refresh token rotation in
 * auth.controller.js.
 *
 * `status` only ever needs 'pending' | 'accepted': a rejected request is
 * deleted outright (see rejectFriendRequest in
 * controllers/friends.controller.js) rather than kept around in a
 * 'rejected' state, so the same two people are free to send a fresh
 * request later without a stale document blocking them.
 */
const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

friendSchema.index({ userA: 1, userB: 1 }, { unique: true })
friendSchema.index({ userA: 1, status: 1 })
friendSchema.index({ userB: 1, status: 1 })

/**
 * Builds the canonical { userA, userB } pair for two user ids, ordering
 * them consistently regardless of who's "self" and who's "other" — so
 * the same two people always map to the same document no matter which
 * of them sends the request.
 */
friendSchema.statics.orderedPair = function orderedPair(idA, idB) {
  const a = String(idA)
  const b = String(idB)
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a }
}

friendSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  },
})

export const Friend = mongoose.model('Friend', friendSchema)
