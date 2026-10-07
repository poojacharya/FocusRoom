import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'

import { createApp } from './src/app.js'
import { connectDB } from './src/config/db.js'
import { initSockets } from './src/sockets/index.js'

const PORT = Number(process.env.PORT || 5000)
const MAX_PORT_ATTEMPTS = 10
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean)

async function start() {
  await connectDB()

  const app = createApp()
  const httpServer = http.createServer(app)

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`Socket.IO origin blocked: ${origin}`))
      },
      credentials: true,
    },
  })
  initSockets(io)

  await listenWithFallback(httpServer, PORT)
}

function listenWithFallback(httpServer, port, attemptsRemaining = MAX_PORT_ATTEMPTS) {
  return new Promise((resolve, reject) => {
    const onListening = () => {
      httpServer.off('error', onError)
      const address = httpServer.address()
      console.log(`[server] listening on http://localhost:${address.port}`)
      resolve()
    }

    const onError = (err) => {
      httpServer.off('listening', onListening)

      if (err.code === 'EADDRINUSE' && process.env.NODE_ENV !== 'production' && attemptsRemaining > 0) {
        const nextPort = port + 1
        console.warn(`[server] port ${port} is occupied; trying ${nextPort}`)
        listenWithFallback(httpServer, nextPort, attemptsRemaining - 1).then(resolve, reject)
        return
      }

      reject(err)
    }

    httpServer.once('listening', onListening)
    httpServer.once('error', onError)
    httpServer.listen(port)
  })
}

start().catch((err) => {
  console.error('[server] failed to start:', err)
  process.exit(1)
})
