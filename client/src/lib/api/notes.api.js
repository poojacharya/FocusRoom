import { api } from '../axios'

export async function fetchNotes() {
  const { data } = await api.get('/notes')
  return data.data // Note[]
}

export async function createNoteRequest({ title = '', body = '' } = {}) {
  const { data } = await api.post('/notes', { title, body })
  return data.data // Note
}

export async function updateNoteRequest({ id, title, body }) {
  const payload = {}
  if (title !== undefined) payload.title = title
  if (body !== undefined) payload.body = body
  const { data } = await api.patch(`/notes/${id}`, payload)
  return data.data // Note
}

export async function deleteNoteRequest(id) {
  await api.delete(`/notes/${id}`)
  return id
}
