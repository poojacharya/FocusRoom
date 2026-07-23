/**
 * Simple client-side substring search across title + description. Fine
 * at personal-task-list scale — same scale assumption as the
 * no-pagination decision on GET /api/tasks (and GET /api/notes before
 * it in Phase 3A).
 */
export function filterTasksBySearch(tasks, query) {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return tasks

  return tasks.filter((task) => {
    const title = (task.title || '').toLowerCase()
    const description = (task.description || '').toLowerCase()
    return title.includes(trimmed) || description.includes(trimmed)
  })
}
