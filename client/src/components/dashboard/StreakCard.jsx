import { Flame } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonLine } from '../ui/Skeleton'
import { useStudyStreak } from '../../hooks/useDashboardData'

export function StreakCard() {
  const { data, isLoading, isError } = useStudyStreak()

  return (
    <Card>
      <SectionHeader title="Productivity streak" />
      {isLoading ? (
        <SkeletonLine className="h-10 w-32" />
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load your streak.</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {data.currentStreak} days
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Longest streak: {data.longestStreak} days
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
