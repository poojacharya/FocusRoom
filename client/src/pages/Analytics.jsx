import { PageContainer } from '../components/ui/PageContainer'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Card } from '../components/ui/Card'
import { AnalyticsStatsCards } from '../components/analytics/AnalyticsStatsCards'
import { WeeklyFocusActivityChart } from '../components/analytics/WeeklyFocusActivityChart'
import { WeeklyTaskCompletionChart } from '../components/analytics/WeeklyTaskCompletionChart'
import { useAnalyticsQuery } from '../hooks/useAnalytics'

export default function Analytics() {
  const { data, isLoading, isError } = useAnalyticsQuery()

  return (
    <PageContainer>
      <SectionHeader title="Analytics" subtitle="Your productivity at a glance" />

      {isError ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your analytics right now.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4">
            <AnalyticsStatsCards data={data} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WeeklyFocusActivityChart data={data?.dailyFocusActivity} isLoading={isLoading} />
            <WeeklyTaskCompletionChart data={data?.dailyTaskCompletion} isLoading={isLoading} />
          </div>
        </>
      )}
    </PageContainer>
  )
}
