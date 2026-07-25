import { Calendar, CalendarClock } from 'lucide-react'
import { TaskListItem } from '../tasks/TaskListItem'
import { EmptyState } from '../ui/EmptyState'
import { SectionHeader } from '../ui/SectionHeader'

function formatSelectedDateLabel(dateKey) {
  if (!dateKey) return null
  // dateKey is a plain 'YYYY-MM-DD' — constructing with explicit
  // year/month/day args (not the string form) keeps this in local time,
  // matching how the calendar grid itself builds its cells.
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function CalendarDayPanel({
  selectedDateKey,
  tasksForDay,
  hasAnyTasks,
  onToggleCompleted,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeader
        title={
          !hasAnyTasks
            ? 'Your tasks'
            : selectedDateKey
              ? formatSelectedDateLabel(selectedDateKey)
              : 'Select a day'
        }
        subtitle={
          hasAnyTasks && selectedDateKey
            ? `${tasksForDay.length} task${tasksForDay.length === 1 ? '' : 's'}`
            : undefined
        }
        className="px-4 pt-4"
      />
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {!hasAnyTasks ? (
          <EmptyState
            icon={CalendarClock}
            title="No tasks yet"
            description="Add a task with a due date to see it here."
          />
        ) : !selectedDateKey ? (
          <EmptyState
            icon={Calendar}
            title="Select a day"
            description="Click a date on the calendar to see what's due."
          />
        ) : tasksForDay.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nothing due this day"
            description="This day is clear — pick another date or add a task."
          />
        ) : (
          <ul className="space-y-1">
            {tasksForDay.map((task) => (
              <TaskListItem
                key={task._id}
                task={task}
                onToggleCompleted={onToggleCompleted}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
