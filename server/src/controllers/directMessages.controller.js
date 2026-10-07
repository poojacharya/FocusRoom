import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Friend } from '../models/Friend.model.js'
import { DirectMessage } from '../models/DirectMessage.model.js'
import { User } from '../models/User.model.js'

async function requireFriend(currentUserId, friendId) {
  const friend = await User.findById(friendId).select('_id')
  if (!friend || String(currentUserId) === String(friendId)) {
    throw new ApiError(404, 'Friend not found')
  }

  const { userA, userB } = Friend.orderedPair(currentUserId, friendId)
  const friendship = await Friend.exists({ userA, userB, status: 'accepted' })
  if (!friendship) throw new ApiError(403, 'Direct messages are available to friends only')
}

export const listDirectMessages = asyncHandler(async (req, res) => {
  await requireFriend(req.user._id, req.params.friendId)
  const recentFirst = await DirectMessage.find({
    $or: [
      { sender: req.user._id, recipient: req.params.friendId },
      { sender: req.params.friendId, recipient: req.user._id },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sender', 'name avatar')

  res.status(200).json(new ApiResponse(200, recentFirst.reverse()))
})

export const sendDirectMessage = asyncHandler(async (req, res) => {
  await requireFriend(req.user._id, req.params.friendId)
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text || text.length > 2000) {
    throw new ApiError(400, 'Message must contain 1 to 2,000 characters')
  }

  const message = await DirectMessage.create({
    sender: req.user._id,
    recipient: req.params.friendId,
    content: text,
  })
  await message.populate('sender', 'name avatar')
  res.status(201).json(new ApiResponse(201, message, 'Message sent'))
})
