import { HISTORY_RANGES } from '../../lib/utils/focusHistory'

export function HistoryFilterTabs({ range, onRangeChange }) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className="inline-flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5"
    >
      {HISTORY_RANGES.map((option) => {
        const isActive = range === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onRangeChange(option.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
