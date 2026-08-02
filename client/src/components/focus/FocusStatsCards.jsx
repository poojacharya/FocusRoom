import { Clock, CheckCircle2, Gauge } from 'lucide-react'
import { Card } from '../ui/Card'
import { SkeletonLine } from '../ui/Skeleton'
import { formatDurationLabel } from '../../lib/utils/formatDuration'

function StatCard({ icon: Icon, label, value, isLoading }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          {isLoading ? (
            <SkeletonLine className="mt-1.5 h-6 w-16" />
          ) : (
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export function FocusStatsCards({ stats, isLoading }) {
  const hasSessions = stats.sessionsCompleted > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Clock}
        label="Total focus time"
        value={hasSessions ? formatDurationLabel(stats.totalSeconds) : '—'}
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle2}
        label="Sessions completed"
        value={stats.sessionsCompleted}
        isLoading={isLoading}
      />
      <StatCard
        icon={Gauge}
        label="Average duration"
        value={hasSessions ? formatDurationLabel(stats.averageSeconds) : '—'}
        isLoading={isLoading}
      />
    </div>
  )
}
