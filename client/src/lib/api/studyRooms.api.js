import { api } from '../axios'

export async function fetchMyRooms() {
  const { data } = await api.get('/study-rooms')
  return data.data // StudyRoom[]
}

export async function fetchRoom(id) {
  const { data } = await api.get(`/study-rooms/${id}`)
  return data.data // StudyRoom
}

// Normalized to the exact shape studyRoom:receiveMessage events already
// use (roomId/text/sender/sentAt) — see hooks/useStudyRoomChat.js — so
// persisted history and live socket messages can sit in the same list
// without the chat panel needing to branch on where a message came from.
export async function fetchRoomMessages(id) {
  const { data } = await api.get(`/study-rooms/${id}/messages`)
  return data.data.map((message) => ({
    _id: message._id,
    roomId: message.room,
    text: message.content,
    sender: message.sender,
    sentAt: message.createdAt,
  }))
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
