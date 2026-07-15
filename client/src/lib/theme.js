const THEME_STORAGE_KEY = 'focushub_theme'

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    // Private browsing / storage disabled — behave as if nothing is saved.
    return null
  }
}

export function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable — the theme still applies for this session via
    // the DOM class, it just won't survive a reload.
  }
}

export function applyThemeClass(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// An explicitly saved preference always wins. Otherwise fall back to the
// OS-level setting — this only matters before the person has ever
// toggled the theme themselves, since setTheme() (in useAppStore) is the
// only thing that writes to storage. Until then, "system" is meant to
// keep tracking the OS, not get silently frozen as a saved choice.
export function resolveInitialTheme() {
  return getStoredTheme() ?? getSystemTheme()
}
