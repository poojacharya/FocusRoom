import { StudyRoom } from '../models/StudyRoom.model.js'

const roomChannel = (roomId) => `study-room:${roomId}`

/**
 * Study Room live chat — join/leave the Socket.IO room backing a
 * StudyRoom document, and broadcast chat messages to whoever is
 * currently joined to it. No persistence (messages aren't saved
 * anywhere) and no presence tracking beyond Socket.IO's own room
 * membership — both explicitly out of scope for this pass.
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

      const message = {
        roomId,
        text: text.trim(),
        sender: { _id: socket.user._id, name: socket.user.name },
        sentAt: new Date().toISOString(),
      }

      // Broadcast-only — nothing here is persisted, per this phase's
      // scope. A later phase can add a Message model and save this
      // before/instead of emitting.
      io.to(channel).emit('studyRoom:receiveMessage', message)
      callback?.({ ok: true })
    } catch {
      callback?.({ ok: false, error: 'Could not send message' })
    }
  })
}
