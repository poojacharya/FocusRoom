/**
 * Short absolute-date formatting for task due dates — deliberately
 * separate from lib/utils/formatRelativeTime.js (Notes' "x ago" style),
 * since a due date reads better as a concrete date ("Due Jul 24") than
 * relative to now.
 */
export function formatDueDate(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function isOverdue(isoString, completed) {
  if (!isoString || completed) return false
  return new Date(isoString).getTime() < Date.now()
}
