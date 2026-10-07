import { Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { SkeletonLine } from '../ui/Skeleton'
import { useStudyStreak } from '../../hooks/useDashboardData'

export function StreakCard() {
  const { data, isLoading, isError } = useStudyStreak()

  return (
    <Link
      to="/analytics"
      aria-label="Open analytics"
      className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
    >
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
    </Link>
  )
}
