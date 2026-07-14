import { Activity } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonLine } from '../ui/Skeleton'
import { useRecentActivity } from '../../hooks/useDashboardData'

export function RecentActivityCard() {
  const { data, isLoading, isError } = useRecentActivity()

  return (
    <Card>
      <SectionHeader title="Recent activity" />
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-5/6" />
          <SkeletonLine className="h-4 w-2/3" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load recent activity.</p>
      ) : data.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Your recent actions will show up here." />
      ) : (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
              <span className="shrink-0 text-xs text-gray-400">{item.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
