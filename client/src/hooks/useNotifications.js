import { useIncomingRequestsQuery } from './useFriends'
import { useTasksQuery } from './useTasks'
import { useSettingsStore } from '../store/useSettingsStore'
import { dueDateToDateKey, toDateKey } from '../lib/utils/calendarDate'

export function useNotifications() {
  const {
    data: incomingRequests = [],
    isLoading: isRequestsLoading,
    isError: isRequestsError,
  } = useIncomingRequestsQuery()
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError } = useTasksQuery()
  const taskRemindersEnabled = useSettingsStore((s) => s.settings.taskReminders)
  const today = toDateKey(new Date())
  const taskReminders = taskRemindersEnabled
    ? tasks
        .filter((task) => {
          if (task.completed) return false
          const dueDate = dueDateToDateKey(task.dueDate)
          return dueDate && dueDate <= today
        })
        .map((task) => ({
          id: `task-${task._id}`,
          label: `${dueDateToDateKey(task.dueDate) < today ? 'Overdue' : 'Due today'}: ${task.title}`,
        }))
    : []

  return {
    data: {
      items: [
        ...incomingRequests.map((request) => ({
          id: request.requestId,
          label: `${request.user.name} sent you a friend request`,
        })),
        ...taskReminders,
      ],
      unreadCount: incomingRequests.length + taskReminders.length,
    },
    isLoading: isRequestsLoading || (taskRemindersEnabled && isTasksLoading),
    isError: isRequestsError || (taskRemindersEnabled && isTasksError),
  }
}
