import { create } from 'zustand'

/**
 * Placeholder global store. Feature-specific state (auth, UI, etc.)
 * will be added as slices when those features are implemented.
 */
export const useAppStore = create((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
