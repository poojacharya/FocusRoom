import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SkeletonBlock } from '../components/ui/Skeleton'
import { PlannerForm } from '../components/planner/PlannerForm'
import { SavedPlanCard } from '../components/planner/SavedPlanCard'
import { useStudyPlanQuery, useGenerateStudySchedule } from '../hooks/useStudyPlan'
import { useStudyPlannerForm } from '../hooks/useStudyPlannerForm'

// Same { examDate, subjects, availableStudyHours } shape the generate
// endpoint expects, but built from the already-saved plan rather than
// the (possibly edited, not-yet-submitted) form draft — this is what
// "regenerate using the same saved inputs" actually means.
function planToGeneratePayload(plan) {
  return {
    examDate: plan.examDate ?? null,
    availableStudyHours: plan.availableStudyHours ?? null,
    subjects: (plan.subjects ?? []).map((subject) => ({
      name: subject.name,
      topics: subject.topics ?? [],
    })),
  }
}

export default function Planner() {
  const { data: plan, isLoading, isError } = useStudyPlanQuery()

  // Two independent mutation instances against the same endpoint/hook —
  // the form's "Generate Plan" submit and the saved-schedule panel's
  // "Regenerate" button are separate actions with separate saved
  // inputs, so each gets its own isPending/isError state rather than
  // sharing one and having their loading/error UI bleed into each other.
  const generateSchedule = useGenerateStudySchedule()
  const regenerateSchedule = useGenerateStudySchedule()

  const form = useStudyPlannerForm(plan, isLoading)

  const handleGenerate = (event) => {
    event.preventDefault()
    generateSchedule.mutate(form.toPayload())
  }

  const handleRegenerate = () => {
    if (!plan) return
    regenerateSchedule.mutate(planToGeneratePayload(plan))
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

          <SavedPlanCard
            plan={plan}
            onRegenerate={handleRegenerate}
            isRegenerating={regenerateSchedule.isPending}
            regenerateError={regenerateSchedule.isError}
          />
        </div>
      )}
    </PageContainer>
  )
}
