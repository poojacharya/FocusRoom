import { Link } from 'react-router-dom'
import { Users2, KeyRound, Crown } from 'lucide-react'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'

const MAX_VISIBLE_AVATARS = 4

export function RoomListItem({ room, currentUserId }) {
  const isOwner = String(room.owner?._id) === String(currentUserId)
  const visibleMembers = room.members.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = room.members.length - visibleMembers.length

  return (
    <Link to={`/study-room/${room._id}`} className="block h-full">
      <Card className="h-full transition-colors duration-150 hover:border-brand-300 dark:hover:border-brand-500/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{room.name}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs tracking-wide text-gray-400 dark:text-gray-500">
              <KeyRound className="h-3 w-3" />
              {room.roomCode}
            </p>
          </div>
          {isOwner && (
            <span
              title="You own this room"
              className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            >
              <Crown className="h-3 w-3" />
              Owner
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {visibleMembers.map((member) => (
              <div key={member._id} className="rounded-full ring-2 ring-white dark:ring-gray-900">
                <Avatar name={member.name} size="sm" />
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-500 ring-2 ring-white dark:bg-white/10 dark:text-gray-300 dark:ring-gray-900">
                +{overflowCount}
              </div>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Users2 className="h-3.5 w-3.5" />
            {room.members.length}
          </span>
        </div>
      </Card>
    </Link>
  )
}
