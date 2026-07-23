import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchTasks,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from '../lib/api/tasks.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const TASKS_KEY = ['tasks']

// Shared by every mutation that returns a single updated task — replaces
// that one task in the cached list in place, leaving every other task's
// object reference untouched so TaskListItem's React.memo can skip
// re-rendering tasks that didn't change.
function patchTaskInCache(queryClient, updatedTask) {
  queryClient.setQueryData(TASKS_KEY, (tasks = []) =>
    tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
  )
}

export function useTasksQuery() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: fetchTasks })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTaskRequest,
    onSuccess: (task) => {
      queryClient.setQueryData(TASKS_KEY, (tasks = []) => [task, ...tasks])
      showSuccessToast('Task created')
    },
    onError: () => showErrorToast("Couldn't create the task"),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTaskRequest,
    onSuccess: (updatedTask) => {
      patchTaskInCache(queryClient, updatedTask)
      showSuccessToast('Task updated')
    },
    onError: () => showErrorToast("Couldn't update the task"),
  })
}

// Toggling complete/incomplete is its own mutation (built on the same
// generic PATCH as useUpdateTask) so it can skip the "Task updated" toast
// a full edit gets — checking a box shouldn't be as noisy as editing
// title/description/priority.
export function useToggleTaskCompleted() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }) => updateTaskRequest({ id, completed }),
    onSuccess: (updatedTask) => patchTaskInCache(queryClient, updatedTask),
    onError: () => showErrorToast("Couldn't update the task"),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTaskRequest,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(TASKS_KEY, (tasks = []) => tasks.filter((t) => t._id !== deletedId))
      showSuccessToast('Task deleted')
    },
    onError: () => showErrorToast("Couldn't delete the task"),
  })
}
