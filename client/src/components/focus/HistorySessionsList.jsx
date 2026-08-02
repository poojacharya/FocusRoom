import { History, Timer as TimerIcon, Hourglass, AlarmClock, Trash2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonLine } from '../ui/Skeleton'
import { formatDurationLabel } from '../../lib/utils/formatDuration'
import { useDeleteFocusSession } from '../../hooks/useFocusSessions'

const MODE_ICON = { pomodoro: TimerIcon, stopwatch: Hourglass, countdown: AlarmClock }
const MODE_LABEL = { pomodoro: 'Pomodoro', stopwatch: 'Stopwatch', countdown: 'Countdown' }

function formatWhen(isoString) {
  const date = new Date(isoString)
  const isToday = date.toDateString() === new Date().toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (isToday) return `Today, ${time}`
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

/**
 * Deliberately takes `sessions` (already filtered by the page's selected
 * range) as a prop instead of querying itself — unlike the Focus page's
 * RecentSessionsList, which is self-contained and always shows the
 * unfiltered latest 8. Two different jobs, so two separate components
 * rather than one bending to fit both.
 */
export function HistorySessionsList({ sessions, isLoading, isError, emptyDescription }) {
  const deleteSession = useDeleteFocusSession()

  return (
    <Card>
      <SectionHeader title="Sessions" subtitle={`${sessions.length} in this range`} />

      {isLoading ? (
        <div className="space-y-2">
          <SkeletonLine className="h-12 w-full" />
          <SkeletonLine className="h-12 w-full" />
          <SkeletonLine className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Couldn&apos;t load your sessions right now.</p>
      ) : sessions.length === 0 ? (
        <EmptyState icon={History} title="No sessions in this range" description={emptyDescription} />
      ) : (
        <ul className="space-y-1">
          {sessions.map((session) => {
            const Icon = MODE_ICON[session.mode] || TimerIcon
            return (
              <li
                key={session._id}
                className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(MODE_LABEL[session.mode] || session.mode)} · {formatDurationLabel(session.duration)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatWhen(session.startedAt)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSession.mutate(session._id)}
                  aria-label="Delete session"
                  className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
