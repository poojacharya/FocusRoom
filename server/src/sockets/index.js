import { socketAuth } from './socketAuth.js'
import { registerStudyRoomHandlers } from './studyRoomSocket.js'

/**
 * Central Socket.io setup. Feature-specific handlers (chat, presence,
 * notifications, etc.) will register themselves here as they're built.
 */
export function initSockets(io) {
  // Every socket must present a valid access token before the
  // 'connection' event fires — the same token issued by
  // /api/auth/register|login|refresh, reused as-is (see socketAuth.js).
  io.use(socketAuth)

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id} (user ${socket.user._id})`)

    registerStudyRoomHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`)
    })
  })
}
