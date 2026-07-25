import { CalendarDayCell } from './CalendarDayCell'
import { WEEKDAY_LABELS } from '../../lib/utils/calendarDate'

// Stable empty-array reference so cells with no tasks always receive the
// same `tasksForDay` prop identity across renders — required for
// CalendarDayCell's React.memo to actually skip re-rendering them.
const EMPTY_TASKS = []

export function CalendarGrid({ weeks, tasksByDate, selectedDateKey, onSelectDate }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 px-2 pb-1 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-2 pb-2">
        {weeks.flat().map((cell) => (
          <CalendarDayCell
            key={cell.dateKey}
            cell={cell}
            tasksForDay={tasksByDate.get(cell.dateKey) || EMPTY_TASKS}
            isSelected={cell.dateKey === selectedDateKey}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
