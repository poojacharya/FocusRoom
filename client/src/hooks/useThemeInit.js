import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { resolveInitialTheme } from '../lib/theme'

/**
 * Runs once on app mount, mirroring useAuthInit's role for the auth
 * store: resolves which theme should be active right now (saved
 * preference, else the OS-level setting) and syncs both the DOM class
 * and useAppStore, so Navbar's toggle icon and anything else reading
 * `theme` is correct from the first render that matters.
 */
export function useThemeInit() {
  const initTheme = useAppStore((s) => s.initTheme)

  useEffect(() => {
    initTheme(resolveInitialTheme())
    // Only ever needs to run once, on mount — see initTheme vs setTheme
    // note in useAppStore.js for why this doesn't persist anything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
