import { useState } from 'react'
import { Plus, KeyRound, UsersRound } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { RoomListItem } from '../components/study-rooms/RoomListItem'
import { CreateRoomModal } from '../components/study-rooms/CreateRoomModal'
import { JoinRoomModal } from '../components/study-rooms/JoinRoomModal'
import { useMyRoomsQuery, useCreateRoom, useJoinRoom } from '../hooks/useStudyRooms'
import { useAuthStore } from '../store/useAuthStore'

export default function StudyRoom() {
  const { data: rooms = [], isLoading, isError } = useMyRoomsQuery()
  const currentUserId = useAuthStore((s) => s.user?._id)

  const createRoom = useCreateRoom()
  const joinRoom = useJoinRoom()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  const handleCreate = (values) => {
    createRoom.mutate(values, { onSuccess: () => setIsCreateOpen(false) })
  }

  const handleJoin = (roomCode) => {
    joinRoom.mutate(roomCode, { onSuccess: () => setIsJoinOpen(false) })
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Study Rooms"
        subtitle="Create a room, or join one with a code"
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" fullWidth={false} onClick={() => setIsJoinOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Join
            </Button>
            <Button type="button" fullWidth={false} onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New room
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-32 w-full" />
        </div>
      ) : isError ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your study rooms right now.
          </p>
        </Card>
      ) : rooms.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersRound}
            title="No study rooms yet"
            description="Create a room to invite friends, or join one with a code."
            action={
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" fullWidth={false} onClick={() => setIsJoinOpen(true)}>
                  Join with code
                </Button>
                <Button type="button" fullWidth={false} onClick={() => setIsCreateOpen(true)}>
                  New room
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomListItem key={room._id} room={room} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={isCreateOpen}
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
        isSubmitting={createRoom.isPending}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onSubmit={handleJoin}
        onClose={() => setIsJoinOpen(false)}
        isSubmitting={joinRoom.isPending}
      />
    </PageContainer>
  )
}
