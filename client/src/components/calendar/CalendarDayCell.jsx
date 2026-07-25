import { memo } from 'react'

const PRIORITY_DOT_COLORS = {
  low: 'bg-gray-400 dark:bg-gray-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

const MAX_VISIBLE_DOTS = 3

function CalendarDayCellComponent({ cell, tasksForDay, isSelected, onSelect }) {
  const { dateKey, day, isCurrentMonth, isToday } = cell
  const taskCount = tasksForDay.length
  const visibleTasks = tasksForDay.slice(0, MAX_VISIBLE_DOTS)
  const overflowCount = taskCount - visibleTasks.length

  return (
    <button
      type="button"
      onClick={() => onSelect(dateKey)}
      aria-pressed={isSelected}
      aria-label={`${day}${isToday ? ', today' : ''}${
        taskCount > 0 ? `, ${taskCount} task${taskCount === 1 ? '' : 's'}` : ''
      }`}
      className={`flex h-16 flex-col items-center gap-1 rounded-xl border px-1 py-1.5 text-sm transition-colors duration-150 sm:h-20 ${
        isSelected
          ? 'border-brand-400 bg-brand-50 dark:border-brand-500/60 dark:bg-brand-500/10'
          : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
      } ${!isCurrentMonth ? 'opacity-40' : ''}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
          isToday
            ? 'bg-brand-500 text-white'
            : isSelected
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {day}
      </span>
      {taskCount > 0 && (
        <div className="flex items-center gap-0.5">
          {visibleTasks.map((task) => (
            <span
              key={task._id}
              className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.medium}`}
            />
          ))}
          {overflowCount > 0 && (
            <span className="text-[9px] leading-none text-gray-400 dark:text-gray-500">
              +{overflowCount}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

// Memoized because a 42-cell grid re-renders often (selection changes,
// month navigation) — this lets cells whose own props didn't change skip
// re-rendering. Pairs with CalendarGrid's stable EMPTY_TASKS fallback so
// days with no tasks reliably bail out.
export const CalendarDayCell = memo(CalendarDayCellComponent)
