/**
 * mm:ss (or h:mm:ss past an hour) live-clock formatting — shared by the
 * Pomodoro, Stopwatch, and Countdown displays so all three read digits
 * identically.
 */
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/**
 * Short human label ("25 min", "1h 30m") for a saved session's total
 * duration — used in the recent-sessions list, where a live mm:ss clock
 * reads oddly for something that's already over.
 */
export function formatDurationLabel(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return `${seconds}s`
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}
