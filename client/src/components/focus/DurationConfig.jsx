import { useFocusTimerStore } from '../../store/useFocusTimerStore'

const PRESETS_BY_MODE = {
  pomodoro: [15, 25, 45, 50],
  countdown: [5, 10, 20, 30],
}

export function DurationConfig({ mode }) {
  const status = useFocusTimerStore((s) => s.status)
  const targetSeconds = useFocusTimerStore((s) => s.targetSeconds)
  const setTargetSeconds = useFocusTimerStore((s) => s.setTargetSeconds)

  // Stopwatch has nothing to configure, and changing the target mid-run
  // would invalidate progress already logged — see setTargetSeconds.
  if (mode === 'stopwatch' || status !== 'idle') return null

  const minutes = Math.round(targetSeconds / 60)
  const presets = PRESETS_BY_MODE[mode] || []

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setTargetSeconds(preset * 60)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              minutes === preset
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            {preset}m
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <label htmlFor="focus-custom-minutes" className="sr-only">
          Custom duration in minutes
        </label>
        <input
          id="focus-custom-minutes"
          type="number"
          min={1}
          max={360}
          value={minutes}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value) && value > 0) setTargetSeconds(value * 60)
          }}
          className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm text-gray-700 outline-none focus:border-brand-400 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
        />
        <span>minutes</span>
      </div>
    </div>
  )
}
