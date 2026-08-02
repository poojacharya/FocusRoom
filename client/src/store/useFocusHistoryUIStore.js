import { create } from 'zustand'

/**
 * UI-only state for the Focus History page — which date range filter is
 * selected. Session *data* lives entirely in the React Query cache (see
 * hooks/useFocusSessions.js, reused unchanged) — mirrors the same split
 * already established by useTasksUIStore/useCalendarUIStore.
 */
export const useFocusHistoryUIStore = create((set) => ({
  range: 'week', // 'today' | 'week' | 'month' | 'all'
  setRange: (range) => set({ range }),
}))
