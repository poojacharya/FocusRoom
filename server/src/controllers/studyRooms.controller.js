import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { StudyRoom } from '../models/StudyRoom.model.js'

const MEMBER_SELECT = 'name email'
const MAX_CODE_GENERATION_ATTEMPTS = 5

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const code = StudyRoom.generateRoomCode()
    // eslint-disable-next-line no-await-in-loop
    const taken = await StudyRoom.exists({ roomCode: code })
    if (!taken) return code
  }
  throw new ApiError(500, 'Could not generate a unique room code, please try again')
}

function populateRoom(query) {
  return query.populate('owner', MEMBER_SELECT).populate('members', MEMBER_SELECT)
}

export const listMyRooms = asyncHandler(async (req, res) => {
  const rooms = await populateRoom(
    StudyRoom.find({ members: req.user._id }).sort({ createdAt: -1 }),
  )
  res.status(200).json(new ApiResponse(200, rooms))
})

export const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body
  const roomCode = await generateUniqueRoomCode()

  const room = await StudyRoom.create({
    name: name.trim(),
    roomCode,
    owner: req.user._id,
    members: [req.user._id],
  })

  const populated = await populateRoom(StudyRoom.findById(room._id))

  res.status(201).json(new ApiResponse(201, populated, 'Study room created'))
})

export const getRoom = asyncHandler(async (req, res) => {
  const room = await populateRoom(
    StudyRoom.findOne({ _id: req.params.id, members: req.user._id }),
  )

  if (!room) {
    throw new ApiError(404, 'Study room not found')
  }

  res.status(200).json(new ApiResponse(200, room))
})

// Atomic check-and-join, mirroring the friend-request accept pattern:
// the filter only matches a document if the presented room code exists
// AND the current user isn't already listed in `members` — so two
// concurrent join calls for the same person can't both "pass" and no
// separate read-then-write race can create a duplicate membership.
export const joinRoom = asyncHandler(async (req, res) => {
  const normalizedCode = req.body.roomCode.trim().toUpperCase()

  const room = await StudyRoom.findOne({ roomCode: normalizedCode })
  if (!room) {
    throw new ApiError(404, 'Invalid room code')
  }

  const alreadyMember = room.members.some((memberId) => String(memberId) === String(req.user._id))
  if (alreadyMember) {
    throw new ApiError(409, 'You are already a member of this room')
  }

  const updated = await populateRoom(
    StudyRoom.findOneAndUpdate(
      { roomCode: normalizedCode, members: { $ne: req.user._id } },
      { $addToSet: { members: req.user._id } },
      { new: true },
    ),
  )

  if (!updated) {
    throw new ApiError(409, 'You are already a member of this room')
  }

  res.status(200).json(new ApiResponse(200, updated, 'Joined study room'))
})

export const leaveRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findOne({ _id: req.params.id, members: req.user._id })
  if (!room) {
    throw new ApiError(404, 'Study room not found')
  }

  if (String(room.owner) === String(req.user._id)) {
    throw new ApiError(400, 'Room owner cannot leave — delete the room instead')
  }

  await StudyRoom.updateOne(
    { _id: req.params.id },
    { $pull: { members: req.user._id } },
  )

  res.status(200).json(new ApiResponse(200, null, 'Left the study room'))
})

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  if (!room) {
    throw new ApiError(404, 'Study room not found')
  }

  res.status(200).json(new ApiResponse(200, null, 'Study room deleted'))
})
