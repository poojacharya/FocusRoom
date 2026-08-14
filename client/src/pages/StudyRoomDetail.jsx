import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, LogOut, Trash2, Users2 } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { RoomMemberItem } from '../components/study-rooms/RoomMemberItem'
import { ChatPanel } from '../components/study-rooms/ChatPanel'
import { useRoomQuery, useLeaveRoom, useDeleteRoom } from '../hooks/useStudyRooms'
import { useAuthStore } from '../store/useAuthStore'
import { showSuccessToast } from '../lib/toast'

export default function StudyRoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?._id)

  const { data: room, isLoading, isError } = useRoomQuery(id)
  const leaveRoom = useLeaveRoom()
  const deleteRoom = useDeleteRoom()

  const isOwner = room && String(room.owner?._id) === String(currentUserId)

  const handleLeave = () => {
    leaveRoom.mutate(id, { onSuccess: () => navigate('/study-room', { replace: true }) })
  }

  const handleDelete = () => {
    deleteRoom.mutate(id, { onSuccess: () => navigate('/study-room', { replace: true }) })
  }

  const handleCopyCode = async () => {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.roomCode)
      showSuccessToast('Room code copied')
    } catch {
      // Clipboard access can be blocked (permissions, insecure context) —
      // the code is already visible on screen, so there's nothing more
      // to do here.
    }
  }

  return (
    <PageContainer>
      <Link
        to="/study-room"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to study rooms
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
      ) : isError || !room ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load this study room. It may have been deleted, or you may no longer be a member.
          </p>
        </Card>
      ) : (
        <>
          <SectionHeader
            title={room.name}
            subtitle={`${room.members.length} member${room.members.length === 1 ? '' : 's'}`}
            action={
              isOwner ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteRoom.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteRoom.isPending ? 'Deleting…' : 'Delete room'}
                </button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  onClick={handleLeave}
                  isLoading={leaveRoom.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  Leave room
                </Button>
              )
            }
          />

          <Card className="mb-4">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <KeyRound className="h-4 w-4 text-brand-500" />
              Room code: <span className="tracking-widest">{room.roomCode}</span>
            </button>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Share this code so others can join from the Study Rooms page.
            </p>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChatPanel />
            </div>

            <Card padding="none">
              <SectionHeader
                title="Members"
                action={
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Users2 className="h-3.5 w-3.5" />
                    {room.members.length}
                  </span>
                }
                className="px-4 pt-4"
              />
              <ul className="space-y-1 p-2 pb-4">
                {room.members.map((member) => (
                  <RoomMemberItem
                    key={member._id}
                    member={member}
                    isOwner={String(member._id) === String(room.owner?._id)}
                  />
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  )
}
