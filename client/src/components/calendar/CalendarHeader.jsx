import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthLabel } from '../../lib/utils/calendarDate'

export function CalendarHeader({ year, month, onPrevious, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-white/10">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
        {getMonthLabel(year, month)}
      </h2>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToday}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
