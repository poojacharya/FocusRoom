import { useMemo } from 'react'
import { useTasksQuery } from './useTasks'
import { useNotesQuery } from './useNotes'
import { useFocusSessionsQuery } from './useFocusSessions'
import { useMyRoomsQuery } from './useStudyRooms'
import { formatRelativeTime } from '../lib/utils/formatRelativeTime'
import { toDateKey } from '../lib/utils/calendarDate'

const RECENT_ACTIVITY_LIMIT = 5
const UPCOMING_SESSIONS_LIMIT = 5
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Tasks summary, Notes summary, and Recent Activity are all derived
 * client-side from the existing GET /api/tasks and GET /api/notes data
 * already fetched by useTasksQuery/useNotesQuery (see hooks/useTasks.js
 * and hooks/useNotes.js) — no dedicated summary or activity endpoint
 * exists, and none is added here. Same client-side-derivation precedent
 * already established by Focus History's stats/chart and the Calendar
 * page's task-by-date grouping. Reusing these queries also means the
 * dashboard shares the same React Query cache entries as the Tasks and
 * Notes pages instead of firing a second, separate fetch.
 *
 * Study streak is derived from GET /api/focus-sessions (consecutive
 * local days with a completed session). Upcoming sessions map the user's
 * study rooms from GET /api/study-rooms — rooms have no scheduled start
 * time, so the card shows live rooms the person has joined.
 */

function dateKeyToLocalDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`)
}

function computeStudyStreak(sessions) {
  const daysWithSession = new Set()
  for (const session of sessions) {
    if (session.completed === false) continue
    const startedAt = new Date(session.startedAt)
    if (Number.isNaN(startedAt.getTime())) continue
    daysWithSession.add(toDateKey(startedAt))
  }

  const sortedDays = [...daysWithSession].sort()
  let longestStreak = 0
  let run = 0
  let previousKey = null
  for (const key of sortedDays) {
    if (previousKey != null) {
      const gap =
        (dateKeyToLocalDate(key).getTime() - dateKeyToLocalDate(previousKey).getTime()) / DAY_MS
      run = Math.round(gap) === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longestStreak = Math.max(longestStreak, run)
    previousKey = key
  }

  let currentStreak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!daysWithSession.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (daysWithSession.has(toDateKey(cursor))) {
    currentStreak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { currentStreak, longestStreak }
}

export function useTasksSummary() {
  const { data: tasks = [], isLoading, isError } = useTasksQuery()

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length
    const total = tasks.length
    return { completed, pending: total - completed, total }
  }, [tasks])

  return { data: summary, isLoading, isError }
}

export function useNotesSummary() {
  const { data: notes = [], isLoading, isError } = useNotesQuery()

  const summary = useMemo(() => {
    // GET /api/notes already returns notes newest-updated-first (see
    // Note.model.js's { owner: 1, updatedAt: -1 } index), so the first
    // entry is always the most recently edited note.
    const lastEdited = notes.length > 0 ? notes[0] : null
    return { totalNotes: notes.length, lastEdited }
  }, [notes])

  return { data: summary, isLoading, isError }
}

export function useStudyStreak() {
  const { data: sessions = [], isLoading, isError } = useFocusSessionsQuery()

  const data = useMemo(() => computeStudyStreak(sessions), [sessions])

  return { data, isLoading, isError }
}

export function useUpcomingSessions() {
  const { data: rooms = [], isLoading, isError } = useMyRoomsQuery()

  const data = useMemo(
    () =>
      rooms.slice(0, UPCOMING_SESSIONS_LIMIT).map((room) => ({
        id: room._id,
        title: room.name,
        startsAt: formatRelativeTime(room.updatedAt || room.createdAt),
        participants: room.members?.length ?? 0,
      })),
    [rooms],
  )

  return { data, isLoading, isError }
}

export function useRecentActivity() {
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError } = useTasksQuery()
  const { data: notes = [], isLoading: isNotesLoading, isError: isNotesError } = useNotesQuery()

  const activity = useMemo(() => {
    const taskEvents = tasks
      .filter((task) => task.completed)
      .map((task) => ({
        id: `task-${task._id}`,
        label: `Completed "${task.title}"`,
        // Tasks have no dedicated completedAt field — updatedAt is used
        // as the best available proxy, same convention already used by
        // the analytics endpoint (see
        // server/src/controllers/analytics.controller.js).
        at: task.updatedAt,
      }))

    const noteEvents = notes.map((note) => ({
      id: `note-${note._id}`,
      label: `Updated "${note.title?.trim() || 'Untitled note'}"`,
      at: note.updatedAt,
    }))

    return [...taskEvents, ...noteEvents]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, RECENT_ACTIVITY_LIMIT)
      .map((event) => ({
        id: event.id,
        label: event.label,
        timestamp: formatRelativeTime(event.at),
      }))
  }, [tasks, notes])

  return {
    data: activity,
    isLoading: isTasksLoading || isNotesLoading,
    isError: isTasksError || isNotesError,
  }
}
