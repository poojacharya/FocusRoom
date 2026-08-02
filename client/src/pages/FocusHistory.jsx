import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionHeader } from '../components/ui/SectionHeader'
import { HistoryFilterTabs } from '../components/focus/HistoryFilterTabs'
import { FocusStatsCards } from '../components/focus/FocusStatsCards'
import { WeeklyFocusChart } from '../components/focus/WeeklyFocusChart'
import { HistorySessionsList } from '../components/focus/HistorySessionsList'
import { useFocusHistoryUIStore } from '../store/useFocusHistoryUIStore'
import { useFocusHistoryData } from '../hooks/useFocusHistoryData'

const EMPTY_DESCRIPTIONS = {
  today: "You haven't logged a focus session today yet.",
  week: 'No sessions so far this week.',
  month: 'No sessions so far this month.',
  all: 'Finish a session on the Focus page and it will show up here.',
}

export default function FocusHistory() {
  const range = useFocusHistoryUIStore((s) => s.range)
  const setRange = useFocusHistoryUIStore((s) => s.setRange)
  const { sessions, stats, chartData, isLoading, isError } = useFocusHistoryData(range)

  return (
    <PageContainer>
      <Link
        to="/focus"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to timer
      </Link>

      <SectionHeader
        title="Focus History"
        subtitle="Review your past sessions"
        action={<HistoryFilterTabs range={range} onRangeChange={setRange} />}
      />

      <div className="mb-4">
        <FocusStatsCards stats={stats} isLoading={isLoading} />
      </div>

      <div className="mb-4">
        <WeeklyFocusChart data={chartData} isLoading={isLoading} />
      </div>

      <HistorySessionsList
        sessions={sessions}
        isLoading={isLoading}
        isError={isError}
        emptyDescription={EMPTY_DESCRIPTIONS[range]}
      />
    </PageContainer>
  )
}
