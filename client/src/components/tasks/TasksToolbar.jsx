import { Search, ArrowUpDown } from 'lucide-react'
import { FILTER_OPTIONS } from '../../lib/utils/taskFilters'
import { SORT_OPTIONS } from '../../lib/utils/taskSort'

export function TasksToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortMode,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter tasks" className="flex gap-1">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={activeFilter === option.value}
              onClick={() => onFilterChange(option.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                activeFilter === option.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
          <label htmlFor="tasks-sort" className="sr-only">
            Sort tasks
          </label>
          <select
            id="tasks-sort"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-6 text-xs text-gray-700 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
