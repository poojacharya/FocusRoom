import { CalendarClock, UsersRound } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonLine } from '../ui/Skeleton'
import { useUpcomingSessions } from '../../hooks/useDashboardData'

export function UpcomingSessionsCard() {
  const { data, isLoading, isError } = useUpcomingSessions()

  return (
    <Card>
      <SectionHeader title="Upcoming sessions" />
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-2/3" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load sessions right now.</p>
      ) : data.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nothing scheduled"
          description="Study room sessions you join will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {data.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {session.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session.startsAt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                <UsersRound className="h-3.5 w-3.5" />
                {session.participants}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
