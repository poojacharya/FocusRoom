/**
 * Central Socket.io setup. Feature-specific handlers (chat, presence,
 * notifications, etc.) will register themselves here as they're built.
 */
export function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`)
    })
  })
}
