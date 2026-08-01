import { useFocusTimerStore } from '../../store/useFocusTimerStore'

const MODES = [
  { value: 'pomodoro', label: 'Pomodoro' },
  { value: 'stopwatch', label: 'Stopwatch' },
  { value: 'countdown', label: 'Countdown' },
]

export function TimerModeTabs() {
  const mode = useFocusTimerStore((s) => s.mode)
  const status = useFocusTimerStore((s) => s.status)
  const setMode = useFocusTimerStore((s) => s.setMode)

  return (
    <div
      role="tablist"
      aria-label="Timer mode"
      className="inline-flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5"
    >
      {MODES.map((option) => {
        const isActive = mode === option.value
        // A session in progress has to be finished or reset before
        // switching modes — otherwise its elapsed time would be silently
        // discarded.
        const isDisabled = status !== 'idle' && !isActive

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => setMode(option.value)}
            title={isDisabled ? 'Finish or reset the current session to switch modes' : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
              isActive
                ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
