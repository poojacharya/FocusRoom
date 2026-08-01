import { api } from '../axios'

export async function fetchFocusSessions() {
  const { data } = await api.get('/focus-sessions')
  return data.data // FocusSession[]
}

export async function createFocusSessionRequest({ mode, duration, startedAt, endedAt, completed = true }) {
  const { data } = await api.post('/focus-sessions', { mode, duration, startedAt, endedAt, completed })
  return data.data // FocusSession
}

// Generic partial update — mirrors updateTaskRequest/updateNoteRequest.
// Not called anywhere in this phase's UI (there's no "edit a past
// session" flow yet), but exposed now so a later phase can use it
// without touching the backend contract.
export async function updateFocusSessionRequest({ id, ...changes }) {
  const { data } = await api.patch(`/focus-sessions/${id}`, changes)
  return data.data // FocusSession
}

export async function deleteFocusSessionRequest(id) {
  await api.delete(`/focus-sessions/${id}`)
  return id
}
