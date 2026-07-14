import { PageContainer } from '../components/ui/PageContainer'
import { DashboardGrid } from '../components/ui/DashboardGrid'
import { WelcomeCard } from '../components/dashboard/WelcomeCard'
import { TasksSummaryCard } from '../components/dashboard/TasksSummaryCard'
import { NotesSummaryCard } from '../components/dashboard/NotesSummaryCard'
import { StudyTimerCard } from '../components/dashboard/StudyTimerCard'
import { StreakCard } from '../components/dashboard/StreakCard'
import { UpcomingSessionsCard } from '../components/dashboard/UpcomingSessionsCard'
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard'

export default function Dashboard() {
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
      </DashboardGrid>
    </PageContainer>
  )
}
