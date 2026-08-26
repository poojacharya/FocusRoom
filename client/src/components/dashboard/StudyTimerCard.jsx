import { Link } from 'react-router-dom'
import { ArrowRight, Timer } from 'lucide-react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

// Links straight through to the real Focus page (built in Phase 4A)
// instead of the disabled "Coming in a later phase" preview this card
// originally shipped with — that button (and its static, never-ticking
// "25:00") no longer reflected the app's actual state once the
// Focus/Pomodoro feature existed.
export function StudyTimerCard() {
  return (
    <Card>
      <SectionHeader title="Study timer" subtitle="Start a focus session" />
      <Link
        to="/focus"
        className="-m-2 flex items-center gap-4 rounded-xl p-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-white/5"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
          <Timer className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Pomodoro, stopwatch &amp; countdown
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ready when you are</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
      </Link>
    </Card>
  )
}
