import { Crown } from 'lucide-react'
import { Avatar } from '../ui/Avatar'

export function RoomMemberItem({ member, isOwner }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={member.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
        </div>
      </div>
      {isOwner && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Crown className="h-3 w-3" />
          Owner
        </span>
      )}
    </li>
  )
}
