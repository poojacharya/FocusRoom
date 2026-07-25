import { useMemo } from 'react'
import { dueDateToDateKey } from '../lib/utils/calendarDate'

/**
 * Groups tasks by their due-date key (YYYY-MM-DD) for O(1) lookup per
 * calendar cell, instead of each of the 42 grid cells filtering the full
 * tasks array on every render. Reads the exact same `tasks` data the
 * Tasks page uses (via useTasksQuery) — no separate fetch, no new API.
 */
export function useTasksByDate(tasks) {
  return useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      const dateKey = dueDateToDateKey(task.dueDate)
      if (!dateKey) continue
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey).push(task)
    }
    return map
  }, [tasks])
}
