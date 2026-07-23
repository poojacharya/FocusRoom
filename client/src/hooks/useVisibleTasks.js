import { useMemo } from 'react'
import { filterTasksBySearch } from '../lib/utils/taskSearch'
import { filterTasksByMode } from '../lib/utils/taskFilters'
import { sortTasks } from '../lib/utils/taskSort'

/**
 * Combines search, filter, and sort into the single list actually shown
 * on the Tasks page — mirrors the same small-derived-list-hook pattern
 * used elsewhere in the app, kept memoized so typing in the search box
 * or switching filter/sort only recomputes when one of those actually
 * changes, not on every unrelated re-render.
 */
export function useVisibleTasks(tasks, { searchQuery, filterMode, sortMode }) {
  return useMemo(() => {
    const searched = filterTasksBySearch(tasks, searchQuery)
    const filtered = filterTasksByMode(searched, filterMode)
    return sortTasks(filtered, sortMode)
  }, [tasks, searchQuery, filterMode, sortMode])
}
