import { create } from 'zustand'

const DEFAULT_POMODORO_SECONDS = 25 * 60
const DEFAULT_COUNTDOWN_SECONDS = 10 * 60

/**
 * Timer state only — saved session *data* lives entirely in the React
 * Query cache (see hooks/useFocusSessions.js). Nothing here persists to
 * localStorage: a page refresh mid-session loses the in-progress timer,
 * same as walking away from a physical kitchen timer. This mirrors the
 * Zustand-for-UI-state / React-Query-for-server-state split already
 * established by useNotesUIStore and useTasksUIStore.
 */
export const useFocusTimerStore = create((set, get) => ({
  mode: 'pomodoro', // 'pomodoro' | 'stopwatch' | 'countdown'
  status: 'idle', // 'idle' | 'running' | 'paused' | 'completed'

  // Only meaningful for pomodoro/countdown — the target the countdown
  // runs down to, in seconds. Always 0 for stopwatch, which has no target.
  targetSeconds: DEFAULT_POMODORO_SECONDS,

  // Ticks up once per second while status === 'running', for every mode.
  // Remaining time for pomodoro/countdown is derived wherever it's
  // rendered as (targetSeconds - elapsedSeconds), never stored twice.
  elapsedSeconds: 0,

  // Set the moment a session first starts; carried through as the
  // `startedAt` value saved to the backend once the session finishes.
  sessionStartedAt: null,

  setMode: (mode) => {
    if (get().status !== 'idle') return // switching mid-run would orphan the current run's progress
    set({
      mode,
      elapsedSeconds: 0,
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
    })),

  pause: () => set((state) => (state.status === 'running' ? { status: 'paused' } : {})),

  resume: () => set((state) => (state.status === 'paused' ? { status: 'running' } : {})),

  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  markCompleted: () => set({ status: 'completed' }),

  // Clears progress and returns to idle, keeping the currently configured
  // target (a person who set a 50-minute pomodoro and resets it shouldn't
  // be bumped back to the 25-minute default).
  reset: () => set({ status: 'idle', elapsedSeconds: 0, sessionStartedAt: null }),
}))

export const FOCUS_TIMER_DEFAULTS = {
  pomodoroSeconds: DEFAULT_POMODORO_SECONDS,
  countdownSeconds: DEFAULT_COUNTDOWN_SECONDS,
}
