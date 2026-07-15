import { create } from 'zustand'
import { applyThemeClass, persistTheme } from '../lib/theme'

/**
 * Global UI state. `theme` starts null and is resolved by useThemeInit on
 * app mount (see hooks/useThemeInit.js) — before that, nothing has
 * queried localStorage or matchMedia yet.
 *
 * Two write paths, deliberately different:
 * - initTheme: called once on boot with the *resolved* theme (saved
 *   preference, or the OS-level fallback). Applies the DOM class but does
 *   NOT persist — an unsaved, system-derived value should keep behaving
 *   like "follow the OS", not get frozen into storage as if it were a
 *   deliberate choice.
 * - setTheme: called when the person explicitly toggles. This is a real
 *   choice, so it's the only path that writes to localStorage.
 */
export const useAppStore = create((set) => ({
  theme: null,

  initTheme: (theme) => {
    applyThemeClass(theme)
    set({ theme })
  },

  setTheme: (theme) => {
    applyThemeClass(theme)
    persistTheme(theme)
    set({ theme })
  },
}))
