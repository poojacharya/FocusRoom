import { CalendarClock, Clock, ListChecks } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { GeneratedScheduleCard } from './GeneratedScheduleCard'
import { formatExamDate, daysUntilExam } from '../../lib/utils/formatExamDate'

function ExamDateSummary({ examDate }) {
  const label = formatExamDate(examDate)
  const remaining = daysUntilExam(examDate)

  return (
    <div className="flex items-start gap-2.5">
      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label || 'No exam date set'}</p>
        {remaining !== null && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {remaining > 0
              ? `${remaining} day${remaining === 1 ? '' : 's'} to go`
              : remaining === 0
                ? 'Today'
                : 'Date has passed'}
          </p>
        )}
      </div>
    </div>
  )
}

export function SavedPlanCard({ plan }) {
  if (!plan) {
    return (
      <Card>
        <SectionHeader title="Your plan" />
        <EmptyState
          icon={CalendarClock}
          title="No plan yet"
          description="Fill out the form and hit Generate Plan to save your first study plan."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Your plan" subtitle="Saved details" />
        <div className="space-y-4 text-sm">
          <ExamDateSummary examDate={plan.examDate} />

          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <p className="text-gray-700 dark:text-gray-200">
              {plan.availableStudyHours != null
                ? `${plan.availableStudyHours} hour${plan.availableStudyHours === 1 ? '' : 's'} / day`
                : 'No study hours set'}
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <div className="min-w-0 flex-1">
              {plan.subjects?.length ? (
                <ul className="space-y-2">
                  {plan.subjects.map((subject) => (
                    <li key={subject._id ?? subject.name}>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{subject.name}</p>
                      {subject.topics?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subject.topics.join(' · ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No subjects added yet</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <GeneratedScheduleCard schedule={plan.generatedSchedule} />
    </div>
  )
}
