import { create } from 'zustand'

/**
 * UI-only state for the Tasks page — task *data* lives entirely in the
 * React Query cache (see hooks/useTasks.js). Mirrors the same split
 * already established for Notes (useNotesUIStore) and the dashboard
 * (useUIStore/useAppStore): search text, active filter, sort mode, and
 * which task (if any) the create/edit modal is showing are all transient
 * view state, never persisted server-side.
 */
export const useTasksUIStore = create((set) => ({
  searchQuery: '',
  activeFilter: 'all', // 'all' | 'active' | 'completed'
  sortMode: 'newest', // 'newest' | 'dueDate' | 'priority'

  // editingTaskId === null with isFormOpen === true means "creating a
  // new task"; a non-null id means "editing that task".
  isFormOpen: false,
  editingTaskId: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setSortMode: (sortMode) => set({ sortMode }),

  openCreateForm: () => set({ isFormOpen: true, editingTaskId: null }),
  openEditForm: (taskId) => set({ isFormOpen: true, editingTaskId: taskId }),
  closeForm: () => set({ isFormOpen: false, editingTaskId: null }),
}))
