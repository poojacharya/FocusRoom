import { io } from 'socket.io-client'
import { useAuthStore } from '../store/useAuthStore'

let socketInstance = null

function resolveSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL
  if (!configuredUrl) return undefined
  return configuredUrl.replace(/\/$/, '')
}

/**
 * Single shared Socket.IO connection for the whole app, created lazily
 * on first use and reused everywhere afterwards. In local dev, the same
 * origin works via Vite's proxy; in production, we explicitly route to
 * the configured API origin so the client does not silently try to open a
 * socket against the frontend host and hang in 'connecting'.
 */
function getSocket() {
  if (!socketInstance) {
    const socketUrl = resolveSocketUrl()
    socketInstance = io(socketUrl || undefined, {
      autoConnect: false,
      withCredentials: true,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    })
  }
  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
  const token = useAuthStore.getState().accessToken

  if (token) {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  socket.on('connect_error', () => {
    const latestToken = useAuthStore.getState().accessToken
    if (latestToken && socket.disconnected) {
      socket.auth = { token: latestToken }
      socket.connect()
    }
  })

  return socket
}
