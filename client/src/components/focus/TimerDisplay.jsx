import { motion } from 'framer-motion'
import { formatClock } from '../../lib/utils/formatDuration'

const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STATUS_LABEL = {
  idle: 'Ready when you are',
  running: 'Focusing…',
  paused: 'Paused',
  completed: 'Complete',
}

export function TimerDisplay({ mode, status, elapsedSeconds, targetSeconds }) {
  const isCountingDown = mode !== 'stopwatch'
  const displaySeconds = isCountingDown ? Math.max(targetSeconds - elapsedSeconds, 0) : elapsedSeconds
  const progress = isCountingDown && targetSeconds > 0 ? Math.min(elapsedSeconds / targetSeconds, 1) : 0

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      {isCountingDown && (
        <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            className="stroke-gray-100 dark:stroke-white/10"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={status === 'completed' ? 'stroke-emerald-500' : 'stroke-brand-500'}
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </svg>
      )}

      <motion.div
        animate={status === 'running' ? { scale: [1, 1.015, 1] } : { scale: 1 }}
        transition={status === 'running' ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        className="flex flex-col items-center"
      >
        <p className="text-5xl font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
          {formatClock(displaySeconds)}
        </p>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {STATUS_LABEL[status] || STATUS_LABEL.idle}
        </p>
      </motion.div>
    </div>
  )
}
