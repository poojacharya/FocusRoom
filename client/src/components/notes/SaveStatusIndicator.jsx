import { Check, Loader2, AlertCircle } from 'lucide-react'

export function SaveStatusIndicator({ status, onRetry }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    )
  }

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Couldn&apos;t save — retry
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <Check className="h-3.5 w-3.5" />
      Saved
    </span>
  )
}
