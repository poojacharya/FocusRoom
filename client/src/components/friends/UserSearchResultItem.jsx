import { UserPlus, Check, X } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

/**
 * The action(s) shown depend entirely on `user.relationship`, computed
 * server-side (see controllers/friends.controller.js#searchUsers):
 * - 'none'             → "Add" button
 * - 'request-sent'     → disabled "Requested" pill
 * - 'request-received' → Accept / Reject, so a mutual search-and-request
 *                         can be resolved right from the results list
 * - 'friends'           → static "Friends" pill (removal happens from
 *                         the friends list below, not from search, so a
 *                         stray click here can't accidentally unfriend
 *                         someone)
 */
export function UserSearchResultItem({ user, onSendRequest, onAccept, onReject, isMutating }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {user.relationship === 'none' && (
          <Button
            type="button"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => onSendRequest(user._id)}
            isLoading={isMutating}
          >
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        )}

        {user.relationship === 'request-sent' && (
          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
            Requested
          </span>
        )}

        {user.relationship === 'request-received' && (
          <>
            <Button
              type="button"
              fullWidth={false}
              className="px-2.5 py-1.5"
              onClick={() => onAccept(user.requestId)}
              isLoading={isMutating}
              aria-label="Accept request"
            >
              <Check className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => onReject(user.requestId)}
              disabled={isMutating}
              aria-label="Reject request"
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}

        {user.relationship === 'friends' && (
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            Friends
          </span>
        )}
      </div>
    </li>
  )
}
