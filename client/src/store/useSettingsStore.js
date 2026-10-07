import { create } from 'zustand'
import { showErrorToast } from '../lib/toast'
import { DEFAULT_SETTINGS, getStoredSettings, normalizeSettings, persistSettings } from '../lib/settings'

function saveSettings(settings) {
  try {
    persistSettings(settings)
  } catch {
    showErrorToast("Couldn't save settings in this browser")
  }
}

export const useSettingsStore = create((set) => ({
  settings: getStoredSettings(),

  updateSetting: (key, value) =>
    set((state) => {
      if (!Object.hasOwn(DEFAULT_SETTINGS, key)) return state

      const settings = normalizeSettings({ ...state.settings, [key]: value })
      saveSettings(settings)
      return { settings }
    }),

  resetSettings: () =>
    set(() => {
      const settings = { ...DEFAULT_SETTINGS }
      saveSettings(settings)
      return { settings }
    }),
}))
