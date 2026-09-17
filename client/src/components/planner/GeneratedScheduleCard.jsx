import { RefreshCw, Sparkles, Clock3, BookOpenText, Target, ListChecks } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

function formatDayLabel(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatMinutes(minutes) {
  const totalMinutes = Number(minutes) || 0
  const hours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  if (!hours && !remainingMinutes) return '0 min'
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

export function GeneratedScheduleCard({ schedule, onRegenerate, isRegenerating, regenerateError }) {
  const days = schedule?.days ?? []
  const totalStudyHours = days.reduce((sum, day) => sum + (Number(day.hours) || 0), 0)
  const averageHours = days.length ? (totalStudyHours / days.length).toFixed(1) : '0.0'

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title="AI-generated study plan"
        subtitle={schedule?.summary || 'Detailed day-by-day roadmap built around your exam date'}
        action={
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={onRegenerate}
            isLoading={isRegenerating}
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        }
      />

      {regenerateError && (
        <p className="mb-3 text-xs text-red-500">
          Couldn&apos;t regenerate your schedule — please try again.
        </p>
      )}

      {days.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No schedule yet"
          description="Fill out your subjects and hit Generate Plan to get a detailed study roadmap."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Study hours</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">{totalStudyHours.toFixed(1)}h</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <BookOpenText className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Avg/day</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">{averageHours}h</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Days</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">{days.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall strategy</p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{schedule.summary}</p>
          </div>

          <div className="space-y-4">
            {days.map((day, index) => (
              <article
                key={`${day.date}-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                      Day {index + 1}
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-50">{formatDayLabel(day.date)}</p>
                  </div>

                  {day.hours != null && (
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {day.hours}h scheduled
                    </span>
                  )}
                </div>

                {day.focusBlocks?.length > 0 && (
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {day.focusBlocks.map((block, blockIndex) => (
                      <div key={`${block.title}-${blockIndex}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{block.title}</p>
                          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {formatMinutes(block.duration || 0)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{block.subject || 'General study'}</p>
                        {block.goal && (
                          <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                            {block.goal}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {day.subjects?.length > 0 && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {day.subjects.map((subject, subjectIndex) => (
                      <div key={`${subject.name}-${subjectIndex}`} className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <ListChecks className="h-4 w-4 text-brand-500" />
                          <p className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</p>
                        </div>
                        {subject.goal && <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">{subject.goal}</p>}
                        {subject.topics?.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            {subject.topics.map((topic, topicIndex) => (
                              <li key={`${topic}-${topicIndex}`} className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {day.notes && <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{day.notes}</p>}
                {day.checkpoint && (
                  <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                    {day.checkpoint}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
