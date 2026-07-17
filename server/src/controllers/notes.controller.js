import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Note } from '../models/Note.model.js'

export const listNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ owner: req.user._id }).sort({ updatedAt: -1 })
  res.status(200).json(new ApiResponse(200, notes))
})

export const createNote = asyncHandler(async (req, res) => {
  const { title = '', body = '' } = req.body
  const note = await Note.create({ owner: req.user._id, title, body })
  res.status(201).json(new ApiResponse(201, note, 'Note created'))
})

export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user._id })
  if (!note) throw new ApiError(404, 'Note not found')
  res.status(200).json(new ApiResponse(200, note))
})

export const updateNote = asyncHandler(async (req, res) => {
  const { title, body } = req.body
  const update = {}
  if (title !== undefined) update.title = title
  if (body !== undefined) update.body = body

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    update,
    { new: true, runValidators: true },
  )
  if (!note) throw new ApiError(404, 'Note not found')
  res.status(200).json(new ApiResponse(200, note, 'Note saved'))
})

export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  if (!note) throw new ApiError(404, 'Note not found')
  res.status(200).json(new ApiResponse(200, null, 'Note deleted'))
})
