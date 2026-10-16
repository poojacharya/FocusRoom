import { RefreshCw, Sparkles, Clock3, BookOpenText, Target, ListChecks, MapPin, ExternalLink } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

function formatDayLabel(dateString) {
  const [year, month, day] = String(dateString).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const RESOURCE_DOMAINS = {
  'Khan Academy': 'khanacademy.org',
  OpenStax: 'openstax.org',
  'MIT OpenCourseWare': 'ocw.mit.edu',
  PhET: 'phet.colorado.edu',
  LibreTexts: 'libretexts.org',
  'Google Scholar': 'scholar.google.com',
}

function resourceSearchUrl(resource) {
  const domain = RESOURCE_DOMAINS[resource.provider]
  if (!domain) return null

  const query = `site:${domain} ${resource.searchQuery}`
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
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

          {schedule.strategy && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Study strategy</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{schedule.strategy}</p>
            </div>
          )}

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
                    {day.focus && <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{day.focus}</p>}
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
                      <section key={`${block.title}-${blockIndex}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            <span className="mr-2 text-brand-600 dark:text-brand-300">{String(blockIndex + 1).padStart(2, '0')}</span>
                            {block.title}
                          </p>
                          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {formatMinutes(block.duration || 0)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">{block.subject || 'General study'}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {block.method && (
                            <span className="rounded-full bg-brand-50 px-2 py-1 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                              {block.method}
                            </span>
                          )}
                          {block.location && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                              <MapPin className="h-3 w-3" />
                              {block.location}
                            </span>
                          )}
                        </div>
                        {block.steps?.length > 0 && (
                          <ol className="mt-3 space-y-2">
                            {block.steps.map((step, stepIndex) => (
                              <li key={`${stepIndex}-${step}`} className="flex items-start gap-2 text-xs leading-5 text-gray-700 dark:text-gray-200">
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200">
                                  {stepIndex + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                        {block.goal && (
                          <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/70 p-2.5 dark:border-brand-500/20 dark:bg-brand-500/5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">Done when</p>
                            <p className="mt-1 text-xs leading-5 text-gray-700 dark:text-gray-200">{block.goal}</p>
                          </div>
                        )}
                        {block.resources?.length > 0 && (
                          <div className="mt-3 border-t border-gray-200 pt-2.5 dark:border-white/10">
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Learning resources</p>
                            <ul className="space-y-1.5">
                              {block.resources.map((resource, resourceIndex) => {
                                const href = resourceSearchUrl(resource)
                                if (!href) return null

                                return (
                                  <li key={`${resource.title}-${resourceIndex}`}>
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-start gap-1.5 text-xs text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                                    >
                                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                                      <span>{resource.title} <span className="text-gray-500 dark:text-gray-400">· {resource.provider}</span></span>
                                    </a>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </section>
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
