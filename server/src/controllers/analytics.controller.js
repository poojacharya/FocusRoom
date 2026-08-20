import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Task } from '../models/Task.model.js'
import { FocusSession } from '../models/FocusSession.model.js'

const TRAILING_DAYS = 7

// Builds the last TRAILING_DAYS local-midnight Date objects, oldest
// first, ending with today — same trailing-window shape referenced by
// the dashboard analytics summary (see PHASE notes in dashboardMockData.js).
function getTrailingDayStarts() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = []
  for (let i = TRAILING_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    days.push(day)
  }
  return days
}

// Local YYYY-MM-DD key — mirrors lib/utils/calendarDate.js's toDateKey
// on the frontend, kept as its own small helper here since this is a
// server-side aggregation, not a shared module between client/server.
function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getProductivityAnalytics = asyncHandler(async (req, res) => {
  const [tasks, focusSessions] = await Promise.all([
    Task.find({ owner: req.user._id }).select('completed updatedAt'),
    FocusSession.find({ user: req.user._id }).select('duration completed startedAt'),
  ])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks

  const completedFocusSessions = focusSessions.filter((session) => session.completed).length
  const totalFocusSeconds = focusSessions.reduce((sum, session) => sum + (session.duration || 0), 0)

  const trailingDays = getTrailingDayStarts()
  const trailingKeys = trailingDays.map(toDateKey)

  const focusSecondsByDay = new Map(trailingKeys.map((key) => [key, 0]))
  for (const session of focusSessions) {
    const key = toDateKey(new Date(session.startedAt))
    if (focusSecondsByDay.has(key)) {
      focusSecondsByDay.set(key, focusSecondsByDay.get(key) + (session.duration || 0))
    }
  }

  // Tasks have no dedicated `completedAt` field — `updatedAt` is used as
  // the best available proxy for "when this task was marked complete",
  // since toggling `completed` is the only write that touches a task
  // after creation in the common case (see updateTask in
  // tasks.controller.js, which always bumps updatedAt on any change).
  const tasksCompletedByDay = new Map(trailingKeys.map((key) => [key, 0]))
  for (const task of tasks) {
    if (!task.completed) continue
    const key = toDateKey(new Date(task.updatedAt))
    if (tasksCompletedByDay.has(key)) {
      tasksCompletedByDay.set(key, tasksCompletedByDay.get(key) + 1)
    }
  }

  const dailyFocusActivity = trailingKeys.map((date) => ({
    date,
    seconds: focusSecondsByDay.get(date) ?? 0,
    minutes: Math.round((focusSecondsByDay.get(date) ?? 0) / 60),
  }))

  const dailyTaskCompletion = trailingKeys.map((date) => ({
    date,
    count: tasksCompletedByDay.get(date) ?? 0,
  }))

  res.status(200).json(
    new ApiResponse(200, {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalFocusSeconds,
      completedFocusSessions,
      dailyFocusActivity,
      dailyTaskCompletion,
    }),
  )
})
