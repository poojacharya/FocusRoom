import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_SETTINGS, getStoredSettings, normalizeSettings, persistSettings } from './settings.js'

test('settings normalization preserves valid choices and fills missing preferences', () => {
  assert.deepEqual(
    normalizeSettings({ focusSessionMinutes: 75, taskReminders: false }),
    { ...DEFAULT_SETTINGS, focusSessionMinutes: 75, taskReminders: false },
  )
})

test('numeric settings are constrained to values supported by their controls', () => {
  assert.deepEqual(
    normalizeSettings({ focusSessionMinutes: 500, plannerDefaultHours: 0.25 }),
    { ...DEFAULT_SETTINGS, focusSessionMinutes: 360, plannerDefaultHours: 0.5 },
  )
  assert.equal(normalizeSettings({ focusSessionMinutes: 27, plannerDefaultHours: 1.7 }).focusSessionMinutes, 25)
  assert.equal(normalizeSettings({ focusSessionMinutes: 27, plannerDefaultHours: 1.7 }).plannerDefaultHours, 1.5)
})

test('invalid values fall back to defaults instead of corrupting settings', () => {
  assert.deepEqual(
    normalizeSettings({
      focusSessionMinutes: 'not a number',
      plannerDefaultHours: 0,
      dailyRecap: 'false',
    }),
    DEFAULT_SETTINGS,
  )
})

test('settings are normalized when persisted and restored', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  }

  try {
    persistSettings({ ...DEFAULT_SETTINGS, focusSessionMinutes: 47, taskReminders: false })
    assert.deepEqual(getStoredSettings(), {
      ...DEFAULT_SETTINGS,
      focusSessionMinutes: 45,
      taskReminders: false,
    })
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else delete globalThis.window
  }
})
