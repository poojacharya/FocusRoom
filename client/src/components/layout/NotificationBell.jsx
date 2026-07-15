import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonLine } from '../ui/Skeleton'

/**
 * Bell icon + dropdown, backed by useNotifications (see
 * hooks/useNotifications.js). The unread dot only renders when
 * `unreadCount > 0` — in Phase 2A it was hardcoded on, which claimed an
 * unread notification that didn't exist; the mock now honestly returns
 * zero until there's a real backend to report a real count.
 */
export function NotificationBell() {
  const containerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading } = useNotifications()
  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    if (!isOpen) return undefined
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-gray-900">
          {isLoading ? (
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-2/3" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="text-sm text-gray-700 dark:text-gray-200">
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
