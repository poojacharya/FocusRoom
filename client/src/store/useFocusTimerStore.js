import { create } from 'zustand'

const DEFAULT_POMODORO_SECONDS = 25 * 60
const DEFAULT_COUNTDOWN_SECONDS = 10 * 60

function computeElapsedSeconds(state) {
  if (state.status === 'running' && state.runningStartedAt != null) {
    const extra = Math.max(0, Math.floor((Date.now() - state.runningStartedAt) / 1000))
    return state.accumulatedSeconds + extra
  }
  return state.accumulatedSeconds
}

/**
 * Timer state only — saved session *data* lives entirely in the React
 * Query cache (see hooks/useFocusSessions.js). Nothing here persists to
 * localStorage: a page refresh mid-session loses the in-progress timer,
 * same as walking away from a physical kitchen timer. This mirrors the
 * Zustand-for-UI-state / React-Query-for-server-state split already
 * established by useNotesUIStore and useTasksUIStore.
 *
 * Elapsed time is timestamp-based: while running, `elapsedSeconds` is
 * accumulatedSeconds + (now - runningStartedAt), so navigating away (or a
 * throttled tab) doesn't lose wall-clock time.
 */
export const useFocusTimerStore = create((set, get) => ({
  mode: 'pomodoro', // 'pomodoro' | 'stopwatch' | 'countdown'
  status: 'idle', // 'idle' | 'running' | 'paused' | 'completed'

  // Only meaningful for pomodoro/countdown — the target the countdown
  // runs down to, in seconds. Always 0 for stopwatch, which has no target.
  targetSeconds: DEFAULT_POMODORO_SECONDS,

  // Frozen elapsed at the last pause/complete, plus the live display
  // value `tick` copies from computeElapsedSeconds.
  accumulatedSeconds: 0,
  elapsedSeconds: 0,

  // Epoch ms when the current running segment started. Null when not running.
  runningStartedAt: null,

  // Set the moment a session first starts; carried through as the
  // `startedAt` value saved to the backend once the session finishes.
  sessionStartedAt: null,

  // Wired by useFocusTimerEngine so Finish still works from the Focus
  // page after the engine is mounted on the dashboard shell (so the
  // clock keeps running across routes).
  isSaving: false,
  finishSession: () => {},
  unlockAlarm: () => {},

  setMode: (mode) => {
    if (get().status !== 'idle') return // switching mid-run would orphan the current run's progress
    set({
      mode,
      elapsedSeconds: 0,
      accumulatedSeconds: 0,
      runningStartedAt: null,
      sessionStartedAt: null,
      targetSeconds:
        mode === 'pomodoro'
          ? DEFAULT_POMODORO_SECONDS
          : mode === 'countdown'
            ? DEFAULT_COUNTDOWN_SECONDS
            : 0,
    })
  },

  // Only adjustable while idle — changing the target mid-run would
  // silently invalidate progress already logged toward the old target.
  setTargetSeconds: (seconds) => {
    if (get().status !== 'idle') return
    set({ targetSeconds: Math.min(Math.max(60, seconds), 6 * 60 * 60) })
  },

  start: () =>
    set((state) => ({
      status: 'running',
      sessionStartedAt: state.sessionStartedAt ?? new Date().toISOString(),
      runningStartedAt: Date.now(),
      accumulatedSeconds: 0,
      elapsedSeconds: 0,
    })),

  pause: () =>
    set((state) => {
      if (state.status !== 'running') return {}
      const elapsed = computeElapsedSeconds(state)
      return {
        status: 'paused',
        accumulatedSeconds: elapsed,
        elapsedSeconds: elapsed,
        runningStartedAt: null,
      }
    }),

  resume: () =>
    set((state) => (state.status === 'paused' ? { status: 'running', runningStartedAt: Date.now() } : {})),

  tick: () =>
    set((state) => {
      if (state.status !== 'running') return {}
      const elapsed = computeElapsedSeconds(state)
      const elapsedSeconds =
        state.mode === 'stopwatch' ? elapsed : Math.min(elapsed, state.targetSeconds)
      return { elapsedSeconds }
    }),

  markCompleted: () =>
    set((state) => {
      const elapsed = computeElapsedSeconds(state)
      return {
        status: 'completed',
        accumulatedSeconds: elapsed,
        elapsedSeconds: elapsed,
        runningStartedAt: null,
      }
    }),

  // Clears progress and returns to idle, keeping the currently configured
  // target (a person who set a 50-minute pomodoro and resets it shouldn't
  // be bumped back to the 25-minute default).
  reset: () =>
    set({
      status: 'idle',
      elapsedSeconds: 0,
      accumulatedSeconds: 0,
      sessionStartedAt: null,
      runningStartedAt: null,
    }),
}))

export const FOCUS_TIMER_DEFAULTS = {
  pomodoroSeconds: DEFAULT_POMODORO_SECONDS,
  countdownSeconds: DEFAULT_COUNTDOWN_SECONDS,
}
