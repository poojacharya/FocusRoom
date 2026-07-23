import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Task } from '../models/Task.model.js'

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
}

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json(new ApiResponse(200, tasks))
})

export const createTask = asyncHandler(async (req, res) => {
  const { title, description = '', priority = 'medium', dueDate = null, tags } = req.body
  const task = await Task.create({
    owner: req.user._id,
    title,
    description,
    priority,
    dueDate,
    tags: normalizeTags(tags),
  })
  res.status(201).json(new ApiResponse(201, task, 'Task created'))
})

export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, completed, priority, dueDate, tags } = req.body
  const update = {}
  if (title !== undefined) update.title = title
  if (description !== undefined) update.description = description
  if (completed !== undefined) update.completed = completed
  if (priority !== undefined) update.priority = priority
  if (dueDate !== undefined) update.dueDate = dueDate
  if (tags !== undefined) update.tags = normalizeTags(tags)

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    update,
    { new: true, runValidators: true },
  )
  if (!task) throw new ApiError(404, 'Task not found')
  res.status(200).json(new ApiResponse(200, task, 'Task saved'))
})

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  if (!task) throw new ApiError(404, 'Task not found')
  res.status(200).json(new ApiResponse(200, null, 'Task deleted'))
})
