import { Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'

function formatDayLabel(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * Read-only display of StudyPlan.generatedSchedule — the structured
 * JSON object Claude returns (see server/src/utils/aiStudyPlanner.js
 * for the exact shape). Purely presentational: no mutation, no editing,
 * matching this phase's brief of displaying the generated result.
 */
export function GeneratedScheduleCard({ schedule }) {
  const days = schedule?.days ?? []

  return (
    <Card>
      <SectionHeader title="AI-generated schedule" subtitle={schedule?.summary} />
      {days.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No schedule yet"
          description="Fill out your subjects and hit Generate Plan to get a Claude-generated day-by-day schedule."
        />
      ) : (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {days.map((day, index) => (
            <li key={`${day.date}-${index}`} className="rounded-xl border border-gray-100 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDayLabel(day.date)}</p>
                {day.hours != null && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {day.hours}h
                  </span>
                )}
              </div>

              {day.subjects?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {day.subjects.map((subject, subjectIndex) => (
                    <li key={`${subject.name}-${subjectIndex}`} className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-800 dark:text-gray-100">{subject.name}</span>
                      {subject.topics?.length > 0 && <span> — {subject.topics.join(', ')}</span>}
                    </li>
                  ))}
                </ul>
              )}

              {day.notes && <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">{day.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
