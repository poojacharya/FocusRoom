import { Check, X } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

export function FriendRequestItem({ request, onAccept, onReject, isMutating }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={request.user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{request.user.name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{request.user.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          fullWidth={false}
          className="px-2.5 py-1.5"
          onClick={() => onAccept(request.requestId)}
          isLoading={isMutating}
          aria-label="Accept request"
        >
          <Check className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={() => onReject(request.requestId)}
          disabled={isMutating}
          aria-label="Reject request"
          className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}
