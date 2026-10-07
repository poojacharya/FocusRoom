import { PageContainer } from '../components/ui/PageContainer'
import { DashboardGrid } from '../components/ui/DashboardGrid'
import { WelcomeCard } from '../components/dashboard/WelcomeCard'
import { TasksSummaryCard } from '../components/dashboard/TasksSummaryCard'
import { NotesSummaryCard } from '../components/dashboard/NotesSummaryCard'
import { StudyTimerCard } from '../components/dashboard/StudyTimerCard'
import { StreakCard } from '../components/dashboard/StreakCard'
import { UpcomingSessionsCard } from '../components/dashboard/UpcomingSessionsCard'
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard'
import { DailyRecapCard } from '../components/dashboard/DailyRecapCard'
import { useSettingsStore } from '../store/useSettingsStore'

export default function Dashboard() {
  const showDailyRecap = useSettingsStore((s) => s.settings.dailyRecap)

  return (
    <PageContainer>
      <div className="mb-6">
        <WelcomeCard />
      </div>
      <DashboardGrid>
        <TasksSummaryCard />
        <NotesSummaryCard />
        <StudyTimerCard />
        <StreakCard />
        <UpcomingSessionsCard />
        <RecentActivityCard />
        {showDailyRecap && <DailyRecapCard />}
      </DashboardGrid>
    </PageContainer>
  )
}
