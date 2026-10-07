import { StudyRoom } from '../models/StudyRoom.model.js'
import { ChatMessage } from '../models/ChatMessage.model.js'

const roomChannel = (roomId) => `study-room:${roomId}`
const MAX_ATTACHMENTS = 5
const MAX_TOTAL_ATTACHMENT_BYTES = 5 * 1024 * 1024

export function validateChatAttachments(attachments) {
  if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) return false

  let totalBytes = 0
  for (const attachment of attachments) {
    const dataType = typeof attachment?.data === 'string'
      ? attachment.data.match(/^data:([^;,]+);base64,/i)?.[1]
      : null
    if (
      !attachment ||
      typeof attachment.name !== 'string' ||
      !attachment.name.trim() ||
      attachment.name.length > 255 ||
      typeof attachment.type !== 'string' ||
      typeof attachment.data !== 'string' ||
      !/^data:(image\/(png|jpeg|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-(excel|powerpoint))|text\/(plain|csv));base64,/i.test(attachment.data) ||
      dataType?.toLowerCase() !== attachment.type.toLowerCase()
    ) {
      return false
    }

    const encoded = attachment.data.slice(attachment.data.indexOf(',') + 1)
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) return false
    totalBytes += Math.floor((encoded.length * 3) / 4)
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) return false
  }
  return true
}

async function broadcastRoomMembers(io, roomId, leavingSocketId = null) {
  const room = await StudyRoom.findById(roomId).populate('members', 'name email avatar')
  if (!room) return

  const sockets = await io.in(roomChannel(roomId)).fetchSockets()
  const onlineIds = [...new Set(sockets
    .filter((memberSocket) => memberSocket.id !== leavingSocketId)
    .map((memberSocket) => String(memberSocket.data.user._id)))]
  io.to(roomChannel(roomId)).emit('studyRoom:members', {
    roomId,
    members: room.members,
    onlineIds,
  })
}

/**
 * Study Room live chat — join/leave the Socket.IO room backing a
 * StudyRoom document, and broadcast chat messages to whoever is
 * currently joined to it. Messages are persisted to ChatMessage before
 * being broadcast (see studyRoom:sendMessage below), and broadcasts room
 * membership/presence changes to active participants.
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
      await broadcastRoomMembers(io, roomId)
      callback?.({ ok: true })
    } catch (error) {
      console.error('[socket] failed to join study room:', error)
      callback?.({ ok: false, error: 'Could not join room' })
    }
  })

  socket.on('studyRoom:leave', (roomId, callback) => {
    if (!roomId || typeof roomId !== 'string') {
      return callback?.({ ok: false, error: 'roomId is required' })
    }
    socket.leave(roomChannel(roomId))
    broadcastRoomMembers(io, roomId).catch((error) => {
      console.error('[socket] failed to update room members after leave:', error)
    })
    callback?.({ ok: true })
  })

  socket.on('studyRoom:sendMessage', async (payload, callback) => {
    try {
      const { roomId, text = '', attachments = [] } = payload || {}

      if (!roomId || typeof roomId !== 'string') {
        return callback?.({ ok: false, error: 'roomId is required' })
      }
      if (typeof text !== 'string' || text.length > 2000 || (!text.trim() && attachments.length === 0)) {
        return callback?.({ ok: false, error: 'Enter a message or attach a file (message limit: 2,000 characters)' })
      }
      if (!validateChatAttachments(attachments)) {
        return callback?.({ ok: false, error: 'Attachments must be supported images/documents totaling 5 MB or less' })
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
        attachments: attachments.map(({ name, type, data }) => ({
          name: name.trim().slice(0, 255),
          type,
          data,
        })),
      })

      const message = {
        _id: saved._id,
        roomId,
        text: saved.content,
        attachments: saved.attachments,
        sender: { _id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
        sentAt: saved.createdAt.toISOString(),
      }

      io.to(channel).emit('studyRoom:receiveMessage', message)
      callback?.({ ok: true })
    } catch (error) {
      console.error('[socket] failed to save study room message:', error)
      callback?.({ ok: false, error: 'Could not send message' })
    }
  })

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (!room.startsWith('study-room:')) continue
      const roomId = room.slice('study-room:'.length)
      broadcastRoomMembers(io, roomId, socket.id).catch((error) => {
        console.error('[socket] failed to update room members after disconnect:', error)
      })
    }
  })
}
