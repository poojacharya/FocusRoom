const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const HISTORY_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All' },
]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Sunday-start week, matching the day-of-week convention already used by
// the Calendar feature's WEEKDAY_LABELS / getMonthGrid (see
// lib/utils/calendarDate.js) — "this week" means the same thing in both
// places.
function startOfWeek(date) {
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function startOfMonth(date) {
  const d = startOfDay(date)
  d.setDate(1)
  return d
}

/**
 * Filters a session list down to the selected calendar range. All ranges
 * are "so far" — e.g. 'week' means "since this Sunday through right now",
 * not a full trailing/leading 7-day window — so a session's `startedAt`
 * only ever needs to be compared against a single lower bound.
 */
export function filterSessionsByRange(sessions, range) {
  if (range === 'all') return sessions

  const now = new Date()
  const rangeStart =
    range === 'today' ? startOfDay(now) : range === 'week' ? startOfWeek(now) : range === 'month' ? startOfMonth(now) : null

  if (!rangeStart) return sessions
  return sessions.filter((session) => new Date(session.startedAt).getTime() >= rangeStart.getTime())
}

export function computeFocusStats(sessions) {
  const sessionsCompleted = sessions.length
  const totalSeconds = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  const averageSeconds = sessionsCompleted > 0 ? Math.round(totalSeconds / sessionsCompleted) : 0
  return { totalSeconds, sessionsCompleted, averageSeconds }
}

/**
 * Always the current Sunday-through-Saturday week, independent of
 * whichever Today/Week/Month/All range is selected on the History page —
 * a "weekly chart" reads as a consistent week-at-a-glance regardless of
 * what range the stats/list above it are currently filtered to.
 */
export function buildWeeklyChartData(sessions) {
  const weekStart = startOfWeek(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return { label: WEEKDAY_SHORT[date.getDay()], minutes: 0 }
  })

  for (const session of sessions) {
    const startedAt = new Date(session.startedAt)
    if (Number.isNaN(startedAt.getTime()) || startedAt < weekStart) continue

    const dayIndex = Math.floor((startOfDay(startedAt).getTime() - weekStart.getTime()) / DAY_MS)
    if (dayIndex < 0 || dayIndex > 6) continue

    days[dayIndex].minutes += (session.duration || 0) / 60
  }

  return days.map((day) => ({ ...day, minutes: Math.round(day.minutes) }))
}
