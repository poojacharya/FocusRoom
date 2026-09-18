import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Note } from '../models/Note.model.js'

export const listNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ owner: req.user._id }).sort({ updatedAt: -1 })
  res.status(200).json(new ApiResponse(200, notes))
})

export const createNote = asyncHandler(async (req, res) => {
  const { title = '', body = '', documents = [] } = req.body
  const normalizedDocuments = Array.isArray(documents)
    ? documents
        .filter((doc) => doc && typeof doc === 'object')
        .map((doc) => ({
          title: typeof doc.title === 'string' ? doc.title.trim() : '',
          url: typeof doc.url === 'string' ? doc.url.trim() : '',
          createdAt: doc.createdAt || new Date().toISOString(),
        }))
        .filter((doc) => doc.title || doc.url)
    : []

  const note = await Note.create({ owner: req.user._id, title, body, documents: normalizedDocuments })
  res.status(201).json(new ApiResponse(201, note, 'Note created'))
})

export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user._id })
  if (!note) throw new ApiError(404, 'Note not found')
  res.status(200).json(new ApiResponse(200, note))
})

export const updateNote = asyncHandler(async (req, res) => {
  const { title, body, documents } = req.body
  const update = {}
  if (title !== undefined) update.title = title
  if (body !== undefined) update.body = body
  if (documents !== undefined) {
    update.documents = Array.isArray(documents)
      ? documents
          .filter((doc) => doc && typeof doc === 'object')
          .map((doc) => ({
            title: typeof doc.title === 'string' ? doc.title.trim() : '',
            url: typeof doc.url === 'string' ? doc.url.trim() : '',
            createdAt: doc.createdAt || new Date().toISOString(),
          }))
          .filter((doc) => doc.title || doc.url)
      : []
  }

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
