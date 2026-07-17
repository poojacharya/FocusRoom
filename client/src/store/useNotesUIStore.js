import { create } from 'zustand'

/**
 * UI-only state for the Notes page. Note *data* lives entirely in the
 * React Query cache (see hooks/useNotes.js) — this store only ever holds
 * which note is selected and whether the mobile view is showing the list
 * or the editor. Mirrors the separation already established by
 * useAppStore/useUIStore.
 */
export const useNotesUIStore = create((set) => ({
  selectedNoteId: null,
  isMobileEditorOpen: false,

  selectNote: (noteId) => set({ selectedNoteId: noteId, isMobileEditorOpen: true }),
  closeMobileEditor: () => set({ isMobileEditorOpen: false }),
  clearSelectedNote: () => set({ selectedNoteId: null, isMobileEditorOpen: false }),
}))
