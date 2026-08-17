import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { PlannerForm } from '../components/planner/PlannerForm'
import { SavedPlanCard } from '../components/planner/SavedPlanCard'
import { useStudyPlanQuery, useGenerateStudySchedule } from '../hooks/useStudyPlan'
import { useStudyPlannerForm } from '../hooks/useStudyPlannerForm'

export default function Planner() {
  const { data: plan, isLoading, isError } = useStudyPlanQuery()
  const generateSchedule = useGenerateStudySchedule()

  const form = useStudyPlannerForm(plan, isLoading)

  const handleGenerate = (event) => {
    event.preventDefault()
    generateSchedule.mutate(form.toPayload())
  }

  return (
    <PageContainer>
      <SectionHeader
        title="AI Study Planner"
        subtitle="Lay out your exam, subjects, and study hours — Claude builds the schedule"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonBlock className="h-96 w-full lg:col-span-2" />
          <SkeletonBlock className="h-96 w-full" />
        </div>
      ) : isError ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your study plan right now.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionHeader
              title={plan ? 'Edit your plan' : 'Build your plan'}
              subtitle="Add your exam date, subjects, and how many hours you can study"
            />
            <PlannerForm form={form} onSubmit={handleGenerate} isSaving={generateSchedule.isPending} />
          </Card>

          <SavedPlanCard plan={plan} />
        </div>
      )}
    </PageContainer>
  )
}
