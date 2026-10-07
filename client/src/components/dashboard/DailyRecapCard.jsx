import { useTasksQuery } from '../../hooks/useTasks'
import { useFocusSessionsQuery } from '../../hooks/useFocusSessions'
import { toDateKey } from '../../lib/utils/calendarDate'
import { formatDurationLabel } from '../../lib/utils/formatDuration'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

export function DailyRecapCard() {
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError } = useTasksQuery()
  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useFocusSessionsQuery()

  const today = toDateKey(new Date())
  const completedTasks = tasks.filter(
    (task) => task.completed && task.updatedAt && toDateKey(new Date(task.updatedAt)) === today,
  ).length
  const focusSeconds = sessions.reduce((total, session) => {
    if (session.completed === false || !session.startedAt) return total
    return toDateKey(new Date(session.startedAt)) === today ? total + session.duration : total
  }, 0)

  const isLoading = isTasksLoading || isSessionsLoading
  const isError = isTasksError || isSessionsError

  return (
    <Card>
      <SectionHeader title="Today's recap" subtitle="A quick look at what you accomplished today" />
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading today&apos;s progress…</p>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Couldn&apos;t load today&apos;s recap.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{completedTasks}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasks completed</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formatDurationLabel(focusSeconds)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Focus time</p>
          </div>
        </div>
      )}
    </Card>
  )
}
