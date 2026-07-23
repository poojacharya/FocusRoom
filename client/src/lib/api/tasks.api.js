import { api } from '../axios'

export async function fetchTasks() {
  const { data } = await api.get('/tasks')
  return data.data // Task[]
}

export async function createTaskRequest(task) {
  const { data } = await api.post('/tasks', task)
  return data.data // Task
}

// Generic partial update — accepts any subset of the fields the
// backend's PATCH /api/tasks/:id supports. A full edit passes
// title/description/priority/dueDate/tags; toggling complete/incomplete
// passes just { completed } — same request shape either way.
export async function updateTaskRequest({ id, ...changes }) {
  const { data } = await api.patch(`/tasks/${id}`, changes)
  return data.data // Task
}

export async function deleteTaskRequest(id) {
  await api.delete(`/tasks/${id}`)
  return id
}
