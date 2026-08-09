import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Friend } from '../models/Friend.model.js'
import { User } from '../models/User.model.js'
import { escapeRegex } from '../utils/escapeRegex.js'

const MIN_SEARCH_LENGTH = 2
const SEARCH_RESULT_LIMIT = 20

// Works whether userA/userB have been populated (full user doc) or not
// (raw ObjectId) — every call site below populates first, but this stays
// safe either way rather than assuming the caller always did.
function otherUserOf(doc, currentUserId) {
  const userAId = doc.userA._id ?? doc.userA
  return String(userAId) === String(currentUserId) ? doc.userB : doc.userA
}

function toPublicUser(user) {
  return { _id: user._id, name: user.name, email: user.email }
}

export const searchUsers = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim()
  if (query.length < MIN_SEARCH_LENGTH) {
    return res.status(200).json(new ApiResponse(200, []))
  }

  const regex = new RegExp(escapeRegex(query), 'i')
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: regex }, { email: regex }],
  })
    .select('name email')
    .limit(SEARCH_RESULT_LIMIT)

  if (users.length === 0) {
    return res.status(200).json(new ApiResponse(200, []))
  }

  // One query covering every candidate at once, rather than N queries
  // (one relationship check per search result) — same batch-lookup shape
  // as useTasksByDate.js on the frontend, just server-side.
  const userIds = users.map((u) => u._id)
  const relevantDocs = await Friend.find({
    $or: [
      { userA: req.user._id, userB: { $in: userIds } },
      { userB: req.user._id, userA: { $in: userIds } },
    ],
  })

  const relationshipByUserId = new Map()
  for (const doc of relevantDocs) {
    const otherId = String(otherUserOf(doc, req.user._id))
    if (doc.status === 'accepted') {
      relationshipByUserId.set(otherId, { relationship: 'friends', friendshipId: doc._id })
    } else {
      const sentByMe = String(doc.requestedBy) === String(req.user._id)
      relationshipByUserId.set(otherId, {
        relationship: sentByMe ? 'request-sent' : 'request-received',
        requestId: doc._id,
      })
    }
  }

  const results = users.map((u) => {
    const relationship = relationshipByUserId.get(String(u._id))
    return {
      ...toPublicUser(u),
      relationship: relationship?.relationship || 'none',
      friendshipId: relationship?.friendshipId,
      requestId: relationship?.requestId,
    }
  })

  res.status(200).json(new ApiResponse(200, results))
})

export const listFriends = asyncHandler(async (req, res) => {
  const docs = await Friend.find({
    status: 'accepted',
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })
    .populate('userA', 'name email')
    .populate('userB', 'name email')
    .sort({ updatedAt: -1 })

  const friends = docs.map((doc) => ({
    friendshipId: doc._id,
    user: toPublicUser(otherUserOf(doc, req.user._id)),
    since: doc.updatedAt,
  }))

  res.status(200).json(new ApiResponse(200, friends))
})

export const listIncomingRequests = asyncHandler(async (req, res) => {
  const docs = await Friend.find({
    status: 'pending',
    requestedBy: { $ne: req.user._id },
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })
    .populate('userA', 'name email')
    .populate('userB', 'name email')
    .sort({ createdAt: -1 })

  const requests = docs.map((doc) => ({
    requestId: doc._id,
    user: toPublicUser(otherUserOf(doc, req.user._id)),
    createdAt: doc.createdAt,
  }))

  res.status(200).json(new ApiResponse(200, requests))
})

export const listSentRequests = asyncHandler(async (req, res) => {
  const docs = await Friend.find({
    status: 'pending',
    requestedBy: req.user._id,
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })
    .populate('userA', 'name email')
    .populate('userB', 'name email')
    .sort({ createdAt: -1 })

  const requests = docs.map((doc) => ({
    requestId: doc._id,
    user: toPublicUser(otherUserOf(doc, req.user._id)),
    createdAt: doc.createdAt,
  }))

  res.status(200).json(new ApiResponse(200, requests))
})

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body

  if (String(recipientId) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot send a friend request to yourself')
  }

  // A malformed (non-ObjectId-shaped) recipientId throws a Mongoose
  // CastError here, which the existing global errorHandler already
  // converts to a clean 400 "Invalid id" — same handling Notes/Tasks/
  // FocusSessions get for their own :id route params, reused as-is.
  const recipient = await User.findById(recipientId)
  if (!recipient) {
    throw new ApiError(404, 'User not found')
  }

  const { userA, userB } = Friend.orderedPair(req.user._id, recipientId)
  const existing = await Friend.findOne({ userA, userB })
  if (existing) {
    throw new ApiError(
      409,
      existing.status === 'accepted'
        ? 'You are already friends with this user'
        : 'A friend request already exists between you and this user',
    )
  }

  let friendDoc
  try {
    friendDoc = await Friend.create({ userA, userB, requestedBy: req.user._id, status: 'pending' })
  } catch (err) {
    // Backstop for the rare race where two matching requests land
    // between the findOne check above and this create() — the unique
    // (userA, userB) index still guarantees only one document is ever
    // created; this just turns MongoDB's raw duplicate-key error into
    // the same friendly message the normal path above already returns,
    // rather than falling through to errorHandler.js's generic
    // "account already exists" duplicate-key message, which reads wrong
    // for a friend request.
    if (err.code === 11000) {
      throw new ApiError(409, 'A friend request already exists between you and this user')
    }
    throw err
  }

  res
    .status(201)
    .json(new ApiResponse(201, { requestId: friendDoc._id, user: toPublicUser(recipient) }, 'Friend request sent'))
})

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  // Atomic check-and-update in one call, mirroring the refresh-token
  // rotation pattern in auth.controller.js: the filter only matches if
  // the request is still pending AND the current user is the recipient
  // (a participant who did NOT send it) — so only the recipient can ever
  // accept, and a request can't be double-accepted by two racing calls.
  const request = await Friend.findOneAndUpdate(
    {
      _id: req.params.id,
      status: 'pending',
      requestedBy: { $ne: req.user._id },
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
    },
    { status: 'accepted' },
    { new: true },
  )
    .populate('userA', 'name email')
    .populate('userB', 'name email')

  if (!request) {
    throw new ApiError(404, 'Friend request not found')
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { friendshipId: request._id, user: toPublicUser(otherUserOf(request, req.user._id)) },
        'Friend request accepted',
      ),
    )
})

export const rejectFriendRequest = asyncHandler(async (req, res) => {
  // Declining deletes the document outright (see the model comment on
  // why there's no 'rejected' status) — same requestedBy-exclusion guard
  // as accept, so only the recipient can decline, never the sender.
  const request = await Friend.findOneAndDelete({
    _id: req.params.id,
    status: 'pending',
    requestedBy: { $ne: req.user._id },
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })

  if (!request) {
    throw new ApiError(404, 'Friend request not found')
  }

  res.status(200).json(new ApiResponse(200, null, 'Friend request declined'))
})

export const removeFriend = asyncHandler(async (req, res) => {
  // Ownership scoping via $or on userA/userB — the two-party equivalent
  // of the single `owner: req.user._id` filter Notes/Tasks/FocusSessions
  // use, so one person can never remove a friendship they're not part of
  // just by guessing its id.
  const friendship = await Friend.findOneAndDelete({
    _id: req.params.id,
    status: 'accepted',
    $or: [{ userA: req.user._id }, { userB: req.user._id }],
  })

  if (!friendship) {
    throw new ApiError(404, 'Friend not found')
  }

  res.status(200).json(new ApiResponse(200, null, 'Friend removed'))
})
