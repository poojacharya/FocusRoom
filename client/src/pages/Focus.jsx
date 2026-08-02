import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TimerModeTabs } from '../components/focus/TimerModeTabs'
import { TimerDisplay } from '../components/focus/TimerDisplay'
import { TimerControls } from '../components/focus/TimerControls'
import { DurationConfig } from '../components/focus/DurationConfig'
import { RecentSessionsList } from '../components/focus/RecentSessionsList'
import { useFocusTimerStore } from '../store/useFocusTimerStore'
import { useFocusTimerEngine } from '../hooks/useFocusTimerEngine'

export default function Focus() {
  const mode = useFocusTimerStore((s) => s.mode)
  const status = useFocusTimerStore((s) => s.status)
  const elapsedSeconds = useFocusTimerStore((s) => s.elapsedSeconds)
  const targetSeconds = useFocusTimerStore((s) => s.targetSeconds)
  const start = useFocusTimerStore((s) => s.start)
  const pause = useFocusTimerStore((s) => s.pause)
  const resume = useFocusTimerStore((s) => s.resume)
  const reset = useFocusTimerStore((s) => s.reset)

  // The only place ticking + auto-save actually happen — everything
  // above just reads store state or calls its plain start/pause/resume/
  // reset actions.
  const { isSaving, finishSession } = useFocusTimerEngine()

  return (
    <PageContainer>
      <SectionHeader
        title="Focus"
        subtitle="Pomodoro, stopwatch, and countdown timers"
        action={
          <Link
            to="/focus/history"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <History className="h-4 w-4" />
            History
          </Link>
        }
      />

      <Card padding="lg" className="flex flex-col items-center gap-6">
        <TimerModeTabs />

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-6"
        >
          <TimerDisplay mode={mode} status={status} elapsedSeconds={elapsedSeconds} targetSeconds={targetSeconds} />

          <DurationConfig mode={mode} />

          <TimerControls
            status={status}
            mode={mode}
            isSaving={isSaving}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onFinish={finishSession}
          />
        </motion.div>
      </Card>

      <div className="mt-6">
        <RecentSessionsList />
      </div>
    </PageContainer>
  )
}
