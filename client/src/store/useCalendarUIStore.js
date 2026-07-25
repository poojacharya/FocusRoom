import { create } from 'zustand'
import { toDateKey } from '../lib/utils/calendarDate'

const today = new Date()

/**
 * UI-only state for the Calendar page — which month is currently
 * displayed and which day (if any) is selected to show its tasks in the
 * side panel. Task *data* lives entirely in the React Query cache (see
 * hooks/useTasks.js, reused unchanged here) — this store never holds
 * task data itself, only view state, same split as
 * useNotesUIStore/useTasksUIStore.
 */
export const useCalendarUIStore = create((set) => ({
  visibleYear: today.getFullYear(),
  visibleMonth: today.getMonth(), // 0-indexed, matches native Date
  selectedDateKey: null,

  goToPreviousMonth: () =>
    set((state) => {
      const date = new Date(state.visibleYear, state.visibleMonth - 1, 1)
      return { visibleYear: date.getFullYear(), visibleMonth: date.getMonth() }
    }),
  goToNextMonth: () =>
    set((state) => {
      const date = new Date(state.visibleYear, state.visibleMonth + 1, 1)
      return { visibleYear: date.getFullYear(), visibleMonth: date.getMonth() }
    }),
  goToToday: () => {
    const now = new Date()
    set({
      visibleYear: now.getFullYear(),
      visibleMonth: now.getMonth(),
      selectedDateKey: toDateKey(now),
    })
  },
  selectDate: (dateKey) => set({ selectedDateKey: dateKey }),
}))
