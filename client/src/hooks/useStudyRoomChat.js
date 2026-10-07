import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { connectSocket } from '../lib/socket'
import { roomMessagesKey, useRoomMessagesQuery } from './useStudyRooms'
import { showErrorToast } from '../lib/toast'

/**
 * Owns the live Socket.IO connection for a single Study Room's chat:
 * loads recent persisted history via REST, connects the shared socket,
 * joins the room's channel (`studyRoom:join`), listens for incoming
 * messages (`studyRoom:receiveMessage`), synchronizes them to the room
 * history cache, and exposes a send() function
 * (`studyRoom:sendMessage`) — the exact event names the backend already
 * implements (see server/src/sockets/studyRoomSocket.js).
 */
export function useStudyRoomChat(roomId) {
  const queryClient = useQueryClient()
  const { data: history = [], isLoading: isHistoryLoading } = useRoomMessagesQuery(roomId)

  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('connecting') // 'connecting' | 'joined' | 'error'
  const socketRef = useRef(null)

  // Reset per room: a fresh room starts from its own history, not
  // whatever the previously open room had accumulated.
  useEffect(() => {
    setMessages([])
  }, [roomId])

  // Merge persisted history whenever it loads or refreshes. This preserves
  // live messages already received while history was in flight.
  useEffect(() => {
    if (isHistoryLoading) return
    setMessages((prev) => {
      const merged = new Map(prev.map((message) => [message._id, message]))
      history.forEach((message) => merged.set(message._id, message))
      return [...merged.values()].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
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
      queryClient.setQueryData(roomMessagesKey(roomId), (current = []) =>
        current.some((item) => item._id === message._id)
          ? current
          : [...current, message].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)),
      )
      queryClient.invalidateQueries({ queryKey: roomMessagesKey(roomId) })
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
  }, [queryClient, roomId])

  const sendMessage = useCallback(
    (text, attachments = [], onResult) => {
      const socket = socketRef.current
      const trimmed = text.trim()
      if (!socket || (!trimmed && attachments.length === 0)) return
      socket.emit('studyRoom:sendMessage', { roomId, text: trimmed, attachments }, (response) => {
        if (!response?.ok) {
          showErrorToast(response?.error || "Couldn't send your message")
          onResult?.(false)
          return
        }
        onResult?.(true)
      })
    },
    [roomId],
  )

  return { messages, status, sendMessage }
}
