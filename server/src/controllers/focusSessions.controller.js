import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { FocusSession } from '../models/FocusSession.model.js'

export const listFocusSessions = asyncHandler(async (req, res) => {
  const sessions = await FocusSession.find({ user: req.user._id }).sort({ startedAt: -1 })
  res.status(200).json(new ApiResponse(200, sessions))
})

export const createFocusSession = asyncHandler(async (req, res) => {
  const { mode, duration, startedAt, endedAt, completed = true } = req.body
  const session = await FocusSession.create({
    user: req.user._id,
    mode,
    duration,
    startedAt,
    endedAt,
    completed,
  })
  res.status(201).json(new ApiResponse(201, session, 'Focus session saved'))
})

export const getFocusSession = asyncHandler(async (req, res) => {
  const session = await FocusSession.findOne({ _id: req.params.id, user: req.user._id })
  if (!session) throw new ApiError(404, 'Focus session not found')
  res.status(200).json(new ApiResponse(200, session))
})

// Single generic PATCH for partial updates — same convention as
// Notes/Tasks, no field-specific endpoints.
export const updateFocusSession = asyncHandler(async (req, res) => {
  const { mode, duration, startedAt, endedAt, completed } = req.body
  const update = {}
  if (mode !== undefined) update.mode = mode
  if (duration !== undefined) update.duration = duration
  if (startedAt !== undefined) update.startedAt = startedAt
  if (endedAt !== undefined) update.endedAt = endedAt
  if (completed !== undefined) update.completed = completed

  const session = await FocusSession.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    update,
    { new: true, runValidators: true },
  )
  if (!session) throw new ApiError(404, 'Focus session not found')
  res.status(200).json(new ApiResponse(200, session, 'Focus session updated'))
})

export const deleteFocusSession = asyncHandler(async (req, res) => {
  const session = await FocusSession.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!session) throw new ApiError(404, 'Focus session not found')
  res.status(200).json(new ApiResponse(200, null, 'Focus session deleted'))
})
