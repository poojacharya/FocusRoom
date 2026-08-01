import { useEffect, useRef } from 'react'
import { useFocusTimerStore } from '../store/useFocusTimerStore'
import { useCreateFocusSession } from './useFocusSessions'
import { showSuccessToast, showErrorToast } from '../lib/toast'

const COMPLETION_MESSAGE = {
  pomodoro: 'Pomodoro complete — nice focus session 🍅',
  countdown: 'Countdown complete',
  stopwatch: 'Session saved',
}

/**
 * Owns the actual setInterval driving the timer, plus the auto-save that
 * fires the moment a pomodoro/countdown session reaches its target, and
 * the manual "finish" path used to save a stopwatch session (or end a
 * pomodoro/countdown early). Mounted once by the Focus page; everything
 * below it only ever reads derived values or calls the store's
 * start/pause/resume/reset actions directly.
 */
export function useFocusTimerEngine() {
  const mode = useFocusTimerStore((s) => s.mode)
  const status = useFocusTimerStore((s) => s.status)
  const targetSeconds = useFocusTimerStore((s) => s.targetSeconds)
  const elapsedSeconds = useFocusTimerStore((s) => s.elapsedSeconds)
  const sessionStartedAt = useFocusTimerStore((s) => s.sessionStartedAt)
  const tick = useFocusTimerStore((s) => s.tick)
  const markCompleted = useFocusTimerStore((s) => s.markCompleted)
  const reset = useFocusTimerStore((s) => s.reset)

  const createFocusSession = useCreateFocusSession()
  // Guards against the auto-complete effect firing twice for the same
  // run (e.g. a re-render landing exactly on the tick that crosses the
  // target) before the save's onSuccess has had a chance to reset().
  const hasSavedRef = useRef(false)

  // The ticking clock itself. Re-created whenever `status` flips to/away
  // from 'running' — nothing else needs to restart the interval.
  useEffect(() => {
    if (status !== 'running') return undefined
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [status, tick])

  const saveSession = (duration, { silent = false } = {}) => {
    if (!sessionStartedAt || duration < 1) return
    hasSavedRef.current = true
    markCompleted()

    createFocusSession.mutate(
      { mode, duration, startedAt: sessionStartedAt, endedAt: new Date().toISOString(), completed: true },
      {
        onSuccess: () => {
          if (!silent) showSuccessToast(COMPLETION_MESSAGE[mode] || 'Session saved')
          reset()
          hasSavedRef.current = false
        },
        onError: () => {
          showErrorToast("Couldn't save your session — it's still running, try finishing again.")
          hasSavedRef.current = false
        },
      },
    )
  }

  // Auto-save the moment a pomodoro/countdown reaches its configured
  // target. Stopwatch has no target, so it never auto-completes — it's
  // only ever ended via the manual "Finish" control below.
  useEffect(() => {
    if (mode === 'stopwatch') return
    if (status !== 'running') return
    if (elapsedSeconds < targetSeconds) return
    if (hasSavedRef.current) return

    saveSession(targetSeconds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, status, elapsedSeconds, targetSeconds])

  // Manual finish — the only way a stopwatch session ever gets saved,
  // and an early-finish escape hatch for pomodoro/countdown.
  const finishSession = () => {
    const duration = mode === 'stopwatch' ? elapsedSeconds : Math.min(elapsedSeconds, targetSeconds)
    saveSession(duration)
  }

  return {
    isSaving: createFocusSession.isPending,
    finishSession,
  }
}
