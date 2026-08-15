import { StudyRoom } from '../models/StudyRoom.model.js'
import { ChatMessage } from '../models/ChatMessage.model.js'

const roomChannel = (roomId) => `study-room:${roomId}`

/**
 * Study Room live chat — join/leave the Socket.IO room backing a
 * StudyRoom document, and broadcast chat messages to whoever is
 * currently joined to it. Messages are persisted to ChatMessage before
 * being broadcast (see studyRoom:sendMessage below); presence tracking
 * beyond Socket.IO's own room membership remains out of scope.
 */
export function registerStudyRoomHandlers(io, socket) {
  socket.on('studyRoom:join', async (roomId, callback) => {
    try {
      if (!roomId || typeof roomId !== 'string') {
        return callback?.({ ok: false, error: 'roomId is required' })
      }

      // Only actual members of the room may join its socket channel —
      // the same membership check GET /api/study-rooms/:id uses, just
      // re-applied here since sockets don't go through Express route
      // middleware.
      const isMember = await StudyRoom.exists({ _id: roomId, members: socket.user._id })
      if (!isMember) {
        return callback?.({ ok: false, error: 'Not a member of this study room' })
      }

      socket.join(roomChannel(roomId))
      callback?.({ ok: true })
    } catch {
      callback?.({ ok: false, error: 'Could not join room' })
    }
  })

  socket.on('studyRoom:leave', (roomId, callback) => {
    if (!roomId || typeof roomId !== 'string') {
      return callback?.({ ok: false, error: 'roomId is required' })
    }
    socket.leave(roomChannel(roomId))
    callback?.({ ok: true })
  })

  socket.on('studyRoom:sendMessage', async (payload, callback) => {
    try {
      const { roomId, text } = payload || {}

      if (!roomId || typeof roomId !== 'string') {
        return callback?.({ ok: false, error: 'roomId is required' })
      }
      if (!text || typeof text !== 'string' || !text.trim()) {
        return callback?.({ ok: false, error: 'Message text is required' })
      }

      // A socket may only send into a room it has actually joined —
      // enforced via Socket.IO's own room membership rather than a
      // second database round trip.
      const channel = roomChannel(roomId)
      if (!socket.rooms.has(channel)) {
        return callback?.({ ok: false, error: 'Join the room before sending messages' })
      }

      // Persisted first, then broadcast from the saved document — so
      // the id/timestamp on the emitted event are the real, durable
      // ones (usable later for history) rather than values invented at
      // emit time that could drift from what's actually stored.
      const saved = await ChatMessage.create({
        room: roomId,
        sender: socket.user._id,
        content: text.trim(),
      })

      const message = {
        _id: saved._id,
        roomId,
        text: saved.content,
        sender: { _id: socket.user._id, name: socket.user.name },
        sentAt: saved.createdAt.toISOString(),
      }

      io.to(channel).emit('studyRoom:receiveMessage', message)
      callback?.({ ok: true })
    } catch {
      callback?.({ ok: false, error: 'Could not send message' })
    }
  })
}
