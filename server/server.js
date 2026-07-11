import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'

import { createApp } from './src/app.js'
import { connectDB } from './src/config/db.js'
import { initSockets } from './src/sockets/index.js'

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()

  const app = createApp()
  const httpServer = http.createServer(app)

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  })
  initSockets(io)

  httpServer.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('[server] failed to start:', err)
  process.exit(1)
})
