import { useEffect, useState } from 'react'
import { connectSocket } from '../lib/socket'

const EMPTY_MEMBERS = []

export function useStudyRoomPresence(roomId, initialMembers = EMPTY_MEMBERS) {
  const [members, setMembers] = useState(initialMembers)
  const [onlineIds, setOnlineIds] = useState([])

  useEffect(() => {
    setMembers(initialMembers)
    setOnlineIds([])
  }, [initialMembers, roomId])

  useEffect(() => {
    if (!roomId) return undefined

    const socket = connectSocket()
    const handleMembers = (update) => {
      if (update.roomId !== roomId) return
      setMembers(update.members)
      setOnlineIds(update.onlineIds)
    }

    socket.on('studyRoom:members', handleMembers)
    return () => socket.off('studyRoom:members', handleMembers)
  }, [roomId])

  return { members, onlineIds }
}
