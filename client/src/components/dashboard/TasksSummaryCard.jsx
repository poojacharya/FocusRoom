import { CheckSquare } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonLine } from '../ui/Skeleton'
import { useTasksSummary } from '../../hooks/useDashboardData'

export function TasksSummaryCard() {
  const { data, isLoading, isError } = useTasksSummary()

  return (
    <Card>
      <SectionHeader title="Today's tasks" subtitle="Your progress so far" />
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-2/3" />
          <SkeletonLine className="h-2 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load tasks right now.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <CheckSquare className="h-5 w-5 text-brand-500" />
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {data.completed}/{data.total}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">completed</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${data.total ? (data.completed / data.total) * 100 : 0}%` }}
            />
          </div>
        </>
      )}
    </Card>
  )
}
