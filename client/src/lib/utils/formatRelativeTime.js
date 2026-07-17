/**
 * Shared "x ago" formatting for note timestamps. NotesSummaryCard.jsx on
 * the dashboard has its own inline copy of this same logic — left as-is
 * for now (out of this phase's scope), but a good candidate to switch
 * over to this shared version in a later cleanup pass.
 */
export function formatRelativeTime(isoString) {
  const minutes = Math.round((Date.now() - new Date(isoString).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
