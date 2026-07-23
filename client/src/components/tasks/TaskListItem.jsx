import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import { formatDueDate, isOverdue } from '../../lib/utils/formatDate'

const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  high: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
}

function TaskListItemComponent({ task, onToggleCompleted, onEdit, onDelete }) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.completed)

  return (
    <li className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/5">
      <button
        type="button"
        onClick={() => onToggleCompleted(task)}
        aria-pressed={task.completed}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed
            ? 'border-brand-500 bg-brand-500 text-white'
            : 'border-gray-300 text-transparent hover:border-brand-400 dark:border-gray-600'
        }`}
      >
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
          <path
            d="M2 6l2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button type="button" onClick={() => onEdit(task._id)} className="min-w-0 flex-1 text-left">
        <p
          className={`truncate text-sm font-medium ${
            task.completed
              ? 'text-gray-400 line-through dark:text-gray-500'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
          {dueLabel && (
            <span
              className={`text-[11px] ${
                overdue ? 'font-medium text-rose-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {overdue ? 'Overdue · ' : 'Due '}
              {dueLabel}
            </span>
          )}
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-white/5 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(task._id)}
        aria-label="Delete task"
        className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

// Same reasoning as NoteListItem in the Notes module: memoized so an edit
// to one task, or a search/filter/sort change, doesn't re-render every
// other task in the list — this only pays off because patchTaskInCache
// in useTasks.js keeps unrelated task objects referentially stable.
export const TaskListItem = memo(TaskListItemComponent)
