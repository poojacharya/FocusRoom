export const DEFAULT_SETTINGS = {
  focusSessionMinutes: 50,
  plannerDefaultHours: 2,
  dailyRecap: true,
  taskReminders: true,
  autoStartFocus: false,
  compactPlanner: false,
}

const SETTINGS_STORAGE_KEY = 'focusroom_settings'

export function getStoredSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!rawValue) return DEFAULT_SETTINGS

    const parsed = JSON.parse(rawValue)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function persistSettings(settings) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}
