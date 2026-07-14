import { create } from 'zustand'

/**
 * Global UI state only — desktop sidebar collapse and the mobile drawer's
 * open/closed state. Per-feature state (tasks, notes, etc.) does not
 * belong here; each feature gets its own store slice when it's built,
 * same as useAuthStore was added for the Auth feature.
 */
export const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}))
