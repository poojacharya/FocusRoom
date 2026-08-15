import { useCallback, useEffect, useRef, useState } from 'react'
import { connectSocket } from '../lib/socket'

/**
 * Owns the live Socket.IO connection for a single Study Room's chat:
 * connects the shared socket, joins the room's channel
 * (`studyRoom:join`), listens for incoming messages
 * (`studyRoom:receiveMessage`), and exposes a send() function
 * (`studyRoom:sendMessage`) — the exact event names the backend already
 * implements (see server/src/sockets/studyRoomSocket.js). Nothing here
 * is persisted; the message list lives only in this hook's state for as
 * long as the page is open, per this phase's scope.
 */
export function useStudyRoomChat(roomId) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('connecting') // 'connecting' | 'joined' | 'error'
  const socketRef = useRef(null)

  useEffect(() => {
    if (!roomId) return undefined

    const socket = connectSocket()
    socketRef.current = socket
    let cancelled = false

    setStatus('connecting')
    setMessages([])

    function joinRoom() {
      socket.emit('studyRoom:join', roomId, (response) => {
        if (cancelled) return
        setStatus(response?.ok ? 'joined' : 'error')
      })
    }

    function handleReceiveMessage(message) {
      if (message.roomId !== roomId) return
      setMessages((prev) => [...prev, message])
    }

    function handleDisconnect() {
      if (cancelled) return
      setStatus('connecting')
    }

    function handleConnectError() {
      if (cancelled) return
      setStatus('error')
    }

    socket.on('connect', joinRoom)
    socket.on('studyRoom:receiveMessage', handleReceiveMessage)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)

    if (socket.connected) {
      joinRoom()
    }

    return () => {
      cancelled = true
      socket.emit('studyRoom:leave', roomId)
      socket.off('connect', joinRoom)
      socket.off('studyRoom:receiveMessage', handleReceiveMessage)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
    }
  }, [roomId])

  const sendMessage = useCallback(
    (text) => {
      const socket = socketRef.current
      const trimmed = text.trim()
      if (!socket || !trimmed) return
      socket.emit('studyRoom:sendMessage', { roomId, text: trimmed })
    },
    [roomId],
  )

  return { messages, status, sendMessage }
}
