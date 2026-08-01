import { Play, Pause, RotateCcw, Check } from 'lucide-react'
import { Button } from '../ui/Button'

export function TimerControls({ status, mode, isSaving, onStart, onPause, onResume, onReset, onFinish }) {
  const isActive = status === 'running' || status === 'paused'

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === 'idle' && (
        <Button fullWidth={false} className="px-8" onClick={onStart}>
          <Play className="h-4 w-4" />
          Start
        </Button>
      )}

      {status === 'running' && (
        <Button variant="secondary" fullWidth={false} className="px-8" onClick={onPause}>
          <Pause className="h-4 w-4" />
          Pause
        </Button>
      )}

      {status === 'paused' && (
        <Button fullWidth={false} className="px-8" onClick={onResume}>
          <Play className="h-4 w-4" />
          Resume
        </Button>
      )}

      {isActive && (
        <Button variant="ghost" fullWidth={false} onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}

      {/* Stopwatch has no target to auto-complete against, so Finish is
          its only path to a saved session. */}
      {mode === 'stopwatch' && isActive && (
        <Button variant="secondary" fullWidth={false} onClick={onFinish} isLoading={isSaving}>
          <Check className="h-4 w-4" />
          Finish
        </Button>
      )}
    </div>
  )
}
