import { useCallback, useEffect, useRef } from 'react'
import { useFocusTimerStore } from '../store/useFocusTimerStore'
import { useCreateFocusSession } from './useFocusSessions'
import { showSuccessToast, showErrorToast } from '../lib/toast'

const COMPLETION_MESSAGE = {
  pomodoro: 'Pomodoro complete — nice focus session 🍅',
  countdown: 'Countdown complete',
  stopwatch: 'Session saved',
}

function createAlarmContext() {
  if (typeof window === 'undefined') return null
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return null
  try {
    return new AudioContextConstructor()
  } catch {
    return null
  }
}

/**
 * Owns the actual setInterval driving the timer, plus the auto-save that
 * fires the moment a pomodoro/countdown session reaches its target, and
 * the manual "finish" path used to save a stopwatch session (or end a
 * pomodoro/countdown early). Mounted once on the dashboard shell so the
 * clock keeps running (and can auto-save) while navigating between pages.
 * Tick uses wall-clock timestamps from the store, not +1 per interval.
 */
export function useFocusTimerEngine() {
  const mode = useFocusTimerStore((s) => s.mode)
  const status = useFocusTimerStore((s) => s.status)
  const targetSeconds = useFocusTimerStore((s) => s.targetSeconds)
  const elapsedSeconds = useFocusTimerStore((s) => s.elapsedSeconds)
  const tick = useFocusTimerStore((s) => s.tick)
  const markCompleted = useFocusTimerStore((s) => s.markCompleted)
  const reset = useFocusTimerStore((s) => s.reset)

  const createFocusSession = useCreateFocusSession()
  const alarmContextRef = useRef(null)
  // Guards against the auto-complete effect firing twice for the same
  // run (e.g. a re-render landing exactly on the tick that crosses the
  // target) before the save's onSuccess has had a chance to reset().
  const hasSavedRef = useRef(false)

  // Browsers only allow audio after a user gesture. Start/Resume invoke
  // this function directly from their button handlers, so completion can
  // ring even if it happens later while the person is on another page.
  const unlockAlarm = useCallback(() => {
    if (!alarmContextRef.current) alarmContextRef.current = createAlarmContext()
    const context = alarmContextRef.current
    if (context?.state === 'suspended') context.resume().catch(() => {})
  }, [])

  const playAlarm = useCallback(() => {
    const audioUrl = '/alarm.mp3'

    let count = 0
    const maxPlays = 1

    const playNext = () => {
      if (count >= maxPlays) return

      const audio = new Audio(audioUrl)
      audio.volume = 1
      audio.play().catch(() => {})

      count += 1
    }

    playNext()
  }, [])

  // The ticking clock itself. Re-created whenever `status` flips to/away
  // from 'running'. Immediate tick catches up after navigation or a
  // background-tab throttle; interval only refreshes the display.
  useEffect(() => {
    if (status !== 'running') return undefined
    tick()
    const interval = setInterval(tick, 1000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [status, tick])

  const saveSession = (duration, { silent = false } = {}) => {
    const { mode: currentMode, sessionStartedAt } = useFocusTimerStore.getState()
    if (!sessionStartedAt || duration < 1) return
    hasSavedRef.current = true
    markCompleted()

    createFocusSession.mutate(
      {
        mode: currentMode,
        duration,
        startedAt: sessionStartedAt,
        endedAt: new Date().toISOString(),
        completed: true,
      },
      {
        onSuccess: () => {
          if (!silent) showSuccessToast(COMPLETION_MESSAGE[currentMode] || 'Session saved')
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

  const saveSessionRef = useRef(saveSession)
  saveSessionRef.current = saveSession

  // Auto-save the moment a pomodoro/countdown reaches its configured
  // target. Stopwatch has no target, so it never auto-completes — it's
  // only ever ended via the manual "Finish" control below.
  useEffect(() => {
    if (mode === 'stopwatch') return
    if (status !== 'running') return
    if (elapsedSeconds < targetSeconds) return
    if (hasSavedRef.current) return

    playAlarm()
    saveSessionRef.current(targetSeconds)
  }, [mode, status, elapsedSeconds, targetSeconds, playAlarm])

  // Manual finish — the only way a stopwatch session ever gets saved,
  // and an early-finish escape hatch for pomodoro/countdown.
  const finishSession = useCallback(() => {
    tick()
    const latest = useFocusTimerStore.getState()
    const duration =
      latest.mode === 'stopwatch' ? latest.elapsedSeconds : Math.min(latest.elapsedSeconds, latest.targetSeconds)
    saveSessionRef.current(duration)
  }, [tick])

  useEffect(() => {
    useFocusTimerStore.setState({ finishSession })
  }, [finishSession])

  useEffect(() => {
    useFocusTimerStore.setState({ unlockAlarm })
  }, [unlockAlarm])

  useEffect(() => {
    useFocusTimerStore.setState({ isSaving: createFocusSession.isPending })
  }, [createFocusSession.isPending])

  return {
    isSaving: createFocusSession.isPending,
    finishSession,
  }
}
