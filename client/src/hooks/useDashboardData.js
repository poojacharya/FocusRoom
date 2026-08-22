import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTasksQuery } from './useTasks'
import { useNotesQuery } from './useNotes'
import { formatRelativeTime } from '../lib/utils/formatRelativeTime'
import { fetchStudyStreak, fetchUpcomingSessions } from '../lib/mock/dashboardMockData'

const RECENT_ACTIVITY_LIMIT = 5

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
 * Study streak and upcoming study-room sessions stay backed by
 * lib/mock/dashboardMockData.js — there's no streak model or
 * "scheduled session" concept on the backend yet for either.
 */
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
  return useQuery({ queryKey: ['dashboard', 'study-streak'], queryFn: fetchStudyStreak })
}

export function useUpcomingSessions() {
  return useQuery({ queryKey: ['dashboard', 'upcoming-sessions'], queryFn: fetchUpcomingSessions })
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
