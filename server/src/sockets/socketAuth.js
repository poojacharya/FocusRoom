import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/User.model.js'

/**
 * Socket.IO connection middleware, mirroring the existing HTTP `protect`
 * middleware (see middleware/auth.js): verifies the same short-lived
 * access token issued by /api/auth/register|login|refresh, just read
 * from the handshake instead of an Authorization header, and attaches
 * the resolved user to the socket for handlers to use.
 *
 * The client is expected to connect with:
 *   io(SOCKET_URL, { auth: { token: accessToken } })
 */
export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication required'))
    }

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch {
      return next(new Error('Invalid or expired access token'))
    }

    const user = await User.findById(payload.sub)
    if (!user) {
      return next(new Error('User no longer exists'))
    }

    socket.user = user
    next()
  } catch {
    next(new Error('Authentication required'))
  }
}
