export const DEFAULT_SETTINGS = {
  focusSessionMinutes: 50,
  plannerDefaultHours: 2,
  dailyRecap: true,
  taskReminders: true,
  autoStartFocus: false,
  compactPlanner: false,
}

const SETTINGS_STORAGE_KEY = 'focusroom_settings'

export function normalizeSettings(value) {
  const stored = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const focusSessionMinutes = Number(stored.focusSessionMinutes)
  const plannerDefaultHours = Number(stored.plannerDefaultHours)

  return {
    focusSessionMinutes:
      Number.isFinite(focusSessionMinutes) && focusSessionMinutes > 0
        ? Math.round(Math.min(Math.max(focusSessionMinutes, 15), 360) / 5) * 5
        : DEFAULT_SETTINGS.focusSessionMinutes,
    plannerDefaultHours:
      Number.isFinite(plannerDefaultHours) && plannerDefaultHours > 0
        ? Math.round(Math.min(Math.max(plannerDefaultHours, 0.5), 24) * 2) / 2
        : DEFAULT_SETTINGS.plannerDefaultHours,
    dailyRecap: typeof stored.dailyRecap === 'boolean' ? stored.dailyRecap : DEFAULT_SETTINGS.dailyRecap,
    taskReminders:
      typeof stored.taskReminders === 'boolean' ? stored.taskReminders : DEFAULT_SETTINGS.taskReminders,
    autoStartFocus:
      typeof stored.autoStartFocus === 'boolean' ? stored.autoStartFocus : DEFAULT_SETTINGS.autoStartFocus,
    compactPlanner:
      typeof stored.compactPlanner === 'boolean' ? stored.compactPlanner : DEFAULT_SETTINGS.compactPlanner,
  }
}

export function getStoredSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!rawValue) return DEFAULT_SETTINGS

    return normalizeSettings(JSON.parse(rawValue))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function persistSettings(settings) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(settings)))
}
