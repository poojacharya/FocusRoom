import { useQuery } from '@tanstack/react-query'
import {
  fetchTasksSummary,
  fetchNotesSummary,
  fetchStudyStreak,
  fetchUpcomingSessions,
  fetchRecentActivity,
} from '../lib/mock/dashboardMockData'

// Backed by mock data for Phase 2A (see lib/mock/dashboardMockData.js).
// Query keys are namespaced under 'dashboard' so this whole group can be
// invalidated together once real endpoints land and the mock fetchers
// are swapped for `api.get(...)` calls — the hook call sites in the
// widget components below won't need to change at all.

export function useTasksSummary() {
  return useQuery({ queryKey: ['dashboard', 'tasks-summary'], queryFn: fetchTasksSummary })
}

export function useNotesSummary() {
  return useQuery({ queryKey: ['dashboard', 'notes-summary'], queryFn: fetchNotesSummary })
}

export function useStudyStreak() {
  return useQuery({ queryKey: ['dashboard', 'study-streak'], queryFn: fetchStudyStreak })
}

export function useUpcomingSessions() {
  return useQuery({ queryKey: ['dashboard', 'upcoming-sessions'], queryFn: fetchUpcomingSessions })
}

export function useRecentActivity() {
  return useQuery({ queryKey: ['dashboard', 'recent-activity'], queryFn: fetchRecentActivity })
}
