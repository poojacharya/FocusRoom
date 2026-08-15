import { useCallback, useEffect, useRef, useState } from 'react'
import { connectSocket } from '../lib/socket'
import { useRoomMessagesQuery } from './useStudyRooms'

/**
 * Owns the live Socket.IO connection for a single Study Room's chat:
 * loads recent persisted history via REST, connects the shared socket,
 * joins the room's channel (`studyRoom:join`), listens for incoming
 * messages (`studyRoom:receiveMessage`), and exposes a send() function
 * (`studyRoom:sendMessage`) — the exact event names the backend already
 * implements (see server/src/sockets/studyRoomSocket.js).
 */
export function useStudyRoomChat(roomId) {
  const { data: history = [], isLoading: isHistoryLoading } = useRoomMessagesQuery(roomId)

  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('connecting') // 'connecting' | 'joined' | 'error'
  const socketRef = useRef(null)
  const hasSeededHistoryRef = useRef(false)

  // Reset per room: a fresh room starts from its own history, not
  // whatever the previously open room had accumulated.
  useEffect(() => {
    setMessages([])
    hasSeededHistoryRef.current = false
  }, [roomId])

  // Seed the list from persisted history once it loads. Merged rather
  // than overwritten, and de-duplicated by _id, so a live message that
  // already arrived over the socket while history was still loading
  // isn't dropped or double-counted once history lands.
  useEffect(() => {
    if (isHistoryLoading || hasSeededHistoryRef.current) return
    hasSeededHistoryRef.current = true
    setMessages((prev) => {
      const historyIds = new Set(history.map((m) => m._id))
      const liveOnly = prev.filter((m) => !historyIds.has(m._id))
      return [...history, ...liveOnly]
    })
  }, [history, isHistoryLoading])

  useEffect(() => {
    if (!roomId) return undefined

    const socket = connectSocket()
    socketRef.current = socket
    let cancelled = false

    setStatus('connecting')

    function joinRoom() {
      socket.emit('studyRoom:join', roomId, (response) => {
        if (cancelled) return
        setStatus(response?.ok ? 'joined' : 'error')
      })
    }

    function handleReceiveMessage(message) {
      if (message.roomId !== roomId) return
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
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
