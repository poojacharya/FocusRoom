import { io } from 'socket.io-client'
import { useAuthStore } from '../store/useAuthStore'

let socketInstance = null

/**
 * Single shared Socket.IO connection for the whole app, created lazily
 * on first use and reused everywhere afterwards — mirrors the singleton
 * `api` axios instance in lib/axios.js. Connects with no explicit URL so
 * it resolves against the current origin; Vite's dev proxy (see
 * vite.config.js) already forwards '/socket.io' to the backend exactly
 * like it forwards '/api'.
 *
 * Auth is handshake-based (`auth: { token }`), matching the backend's
 * socketAuth middleware (server/src/sockets/socketAuth.js) — the same
 * in-memory access token used for every REST call via lib/axios.js's
 * request interceptor. `auth` is passed as a function so it's
 * re-evaluated on every (re)connection attempt, picking up a refreshed
 * token automatically instead of freezing the one from the first
 * connect.
 */
function getSocket() {
  if (!socketInstance) {
    socketInstance = io({
      autoConnect: false,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    })
  }
  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}
