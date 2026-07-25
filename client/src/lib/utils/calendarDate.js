const DAYS_IN_WEEK = 7
const WEEKS_TO_SHOW = 6 // fixed 6-row grid keeps the calendar's height stable across months

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * For Date objects that represent a genuine local calendar day — grid
 * cells built directly with `new Date(year, month, day)`, and "today".
 * Uses local getters since there's no serialization round-trip involved.
 */
export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * For task.dueDate values coming back from the API. A due date starts
 * life as a plain "YYYY-MM-DD" from the <input type="date"> in
 * TaskFormModal, which the backend/Mongoose stores as UTC midnight for
 * that calendar day. Reading it back with *local* getters can shift the
 * day by one in negative-UTC-offset timezones (UTC midnight is still
 * "yesterday evening" locally) — using the UTC getters instead recovers
 * the exact calendar day the person picked, regardless of where they are.
 */
export function dueDateToDateKey(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Builds a fixed 6-week (42-day) grid for the given month, including the
 * leading/trailing days from adjacent months needed to fill full weeks
 * starting on Sunday. Each cell carries everything it needs to render
 * without a component having to re-derive it.
 */
export function getMonthGrid(year, month, todayDateKey) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay() // 0 (Sun) – 6 (Sat)
  const gridStart = new Date(year, month, 1 - startOffset)

  const cells = []
  for (let i = 0; i < DAYS_IN_WEEK * WEEKS_TO_SHOW; i += 1) {
    const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    const dateKey = toDateKey(cellDate)
    cells.push({
      dateKey,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: dateKey === todayDateKey,
    })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += DAYS_IN_WEEK) {
    weeks.push(cells.slice(i, i + DAYS_IN_WEEK))
  }
  return weeks
}

export function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}
