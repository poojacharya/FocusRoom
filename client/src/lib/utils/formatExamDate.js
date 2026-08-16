/**
 * Study Planner's own date formatting — deliberately separate from
 * lib/utils/formatDate.js (Tasks' short due-date style) and
 * lib/utils/formatRelativeTime.js (Notes' "x ago" style), matching the
 * per-feature separation already established by those two modules.
 */
export function formatExamDate(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Whole calendar days between today and the exam date, compared at
// local midnight so "today" and "tomorrow" read correctly regardless of
// what time of day it currently is.
export function daysUntilExam(isoString) {
  if (!isoString) return null
  const target = new Date(isoString)
  if (Number.isNaN(target.getTime())) return null

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTarget = new Date(target)
  startOfTarget.setHours(0, 0, 0, 0)

  const diffMs = startOfTarget.getTime() - startOfToday.getTime()
  return Math.round(diffMs / (24 * 60 * 60 * 1000))
}
