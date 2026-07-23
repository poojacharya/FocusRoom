export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
]

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 }

function byNewest(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt)
}

// Tasks without a due date sort after ones that have one, regardless of
// direction — an undated task isn't "due sooner" than a dated one, so it
// never jumps to the top just because null coerces to a small number.
function byDueDate(a, b) {
  if (!a.dueDate && !b.dueDate) return byNewest(a, b)
  if (!a.dueDate) return 1
  if (!b.dueDate) return -1
  return new Date(a.dueDate) - new Date(b.dueDate)
}

function byPriority(a, b) {
  return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
}

const COMPARATORS = {
  newest: byNewest,
  dueDate: byDueDate,
  priority: byPriority,
}

export function sortTasks(tasks, sortMode) {
  const comparator = COMPARATORS[sortMode] || byNewest
  return [...tasks].sort(comparator)
}
