import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyRooms,
  fetchRoom,
  createRoomRequest,
  joinRoomRequest,
  leaveRoomRequest,
  deleteRoomRequest,
} from '../lib/api/studyRooms.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const ROOMS_KEY = ['studyRooms']
const roomKey = (id) => ['studyRooms', id]

export function useMyRoomsQuery() {
  return useQuery({ queryKey: ROOMS_KEY, queryFn: fetchMyRooms })
}

export function useRoomQuery(id) {
  return useQuery({
    queryKey: roomKey(id),
    queryFn: () => fetchRoom(id),
    enabled: Boolean(id),
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRoomRequest,
    onSuccess: (room) => {
      queryClient.setQueryData(ROOMS_KEY, (rooms = []) => [room, ...rooms])
      queryClient.setQueryData(roomKey(room._id), room)
      showSuccessToast('Study room created')
    },
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't create the room"),
  })
}

export function useJoinRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: joinRoomRequest,
    onSuccess: (room) => {
      queryClient.setQueryData(ROOMS_KEY, (rooms = []) => {
        const alreadyListed = rooms.some((r) => r._id === room._id)
        return alreadyListed ? rooms.map((r) => (r._id === room._id ? room : r)) : [room, ...rooms]
      })
      queryClient.setQueryData(roomKey(room._id), room)
      showSuccessToast(`Joined "${room.name}"`)
    },
    onError: (error) =>
      showErrorToast(error?.response?.data?.message || "Couldn't join — check the room code and try again"),
  })
}

export function useLeaveRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: leaveRoomRequest,
    onSuccess: (id) => {
      queryClient.setQueryData(ROOMS_KEY, (rooms = []) => rooms.filter((r) => r._id !== id))
      queryClient.removeQueries({ queryKey: roomKey(id) })
      showSuccessToast('Left the study room')
    },
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't leave the room"),
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoomRequest,
    onSuccess: (id) => {
      queryClient.setQueryData(ROOMS_KEY, (rooms = []) => rooms.filter((r) => r._id !== id))
      queryClient.removeQueries({ queryKey: roomKey(id) })
      showSuccessToast('Study room deleted')
    },
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't delete the room"),
  })
}
