import { UserMinus } from 'lucide-react'
import { Avatar } from '../ui/Avatar'

// Hover-to-reveal destructive action, same convention as
// TaskListItem/NoteListItem's delete buttons — a friends list is
// browsed passively, so removal shouldn't compete for visual attention
// until the person is actually hovering that row.
export function FriendListItem({ friend, onRemove, isRemoving }) {
  return (
    <li className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={friend.user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{friend.user.name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{friend.user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(friend.friendshipId)}
        disabled={isRemoving}
        aria-label="Remove friend"
        className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 disabled:opacity-50 group-hover:opacity-100 dark:hover:bg-red-500/10"
      >
        <UserMinus className="h-4 w-4" />
      </button>
    </li>
  )
}
