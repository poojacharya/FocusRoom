import { Clock, CheckCircle2, Percent } from 'lucide-react'
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

// Reads straight off GET /api/analytics — same three-card layout
// convention as FocusStatsCards on the Focus History page, but scoped
// to the metrics that page doesn't cover: overall session count, and
// task completion rate.
export function AnalyticsStatsCards({ data, isLoading }) {
  const hasFocusData = (data?.completedFocusSessions ?? 0) > 0
  const hasTasks = (data?.totalTasks ?? 0) > 0
  const completionRate = hasTasks
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Clock}
        label="Total focus time"
        value={hasFocusData ? formatDurationLabel(data.totalFocusSeconds) : '—'}
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle2}
        label="Completed sessions"
        value={data?.completedFocusSessions ?? 0}
        isLoading={isLoading}
      />
      <StatCard
        icon={Percent}
        label="Task completion rate"
        value={completionRate !== null ? `${completionRate}%` : '—'}
        isLoading={isLoading}
      />
    </div>
  )
}
