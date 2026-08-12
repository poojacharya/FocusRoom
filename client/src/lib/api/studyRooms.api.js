import { api } from '../axios'

export async function fetchMyRooms() {
  const { data } = await api.get('/study-rooms')
  return data.data // StudyRoom[]
}

export async function fetchRoom(id) {
  const { data } = await api.get(`/study-rooms/${id}`)
  return data.data // StudyRoom
}

export async function createRoomRequest({ name }) {
  const { data } = await api.post('/study-rooms', { name })
  return data.data // StudyRoom
}

export async function joinRoomRequest(roomCode) {
  const { data } = await api.post('/study-rooms/join', { roomCode })
  return data.data // StudyRoom
}

export async function leaveRoomRequest(id) {
  await api.post(`/study-rooms/${id}/leave`)
  return id
}

export async function deleteRoomRequest(id) {
  await api.delete(`/study-rooms/${id}`)
  return id
}
