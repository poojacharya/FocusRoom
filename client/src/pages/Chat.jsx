import { useEffect, useState } from 'react'
import { MessageSquare, MessagesSquare } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { ChatPanel } from '../components/study-rooms/ChatPanel'
import { useMyRoomsQuery } from '../hooks/useStudyRooms'

export default function Chat() {
  const { data: rooms = [], isLoading, isError } = useMyRoomsQuery()
  const [selectedRoomId, setSelectedRoomId] = useState('')

  useEffect(() => {
    if (!rooms.length) {
      setSelectedRoomId('')
      return
    }

    setSelectedRoomId((current) => {
      if (current && rooms.some((room) => room._id === current)) return current
      return rooms[0]._id
    })
  }, [rooms])

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title="Chat" subtitle="Loading your study rooms" />
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <SkeletonBlock className="h-80 w-full" />
          <SkeletonBlock className="h-80 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (isError) {
    return (
      <PageContainer>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load your study rooms right now.</p>
        </Card>
      </PageContainer>
    )
  }

  if (rooms.length === 0) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            icon={MessagesSquare}
            title="No study room yet"
            description="Create or join a room to start chatting with your group."
            action={
              <Button type="button" variant="secondary" onClick={() => window.location.assign('/study-room')}>
                Open study rooms
              </Button>
            }
          />
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionHeader title="Chat" subtitle="Live room conversations" />

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <MessageSquare className="h-4 w-4 text-brand-500" />
              Study rooms
            </div>
          </div>

          <div className="space-y-2 p-3">
            {rooms.map((room) => {
              const isSelected = room._id === selectedRoomId

              return (
                <button
                  key={room._id}
                  type="button"
                  onClick={() => setSelectedRoomId(room._id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{room.name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-300">
                      {room.members?.length || 0}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{room.roomCode}</p>
                </button>
              )
            })}
          </div>
        </Card>

        {selectedRoomId ? <ChatPanel roomId={selectedRoomId} /> : null}
      </div>
    </PageContainer>
  )
}
