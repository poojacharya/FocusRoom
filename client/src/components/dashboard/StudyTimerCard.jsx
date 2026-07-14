import { Play, Timer } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'

// Static preview only — the real countdown/session logic belongs to the
// Pomodoro Timer feature (roadmap item 11), out of scope for this phase.
export function StudyTimerCard() {
  return (
    <Card>
      <SectionHeader title="Study timer" subtitle="Start a focus session" />
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
          <Timer className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
            25:00
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ready when you are</p>
        </div>
        <Button variant="secondary" fullWidth={false} className="px-3" disabled title="Coming in a later phase">
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
