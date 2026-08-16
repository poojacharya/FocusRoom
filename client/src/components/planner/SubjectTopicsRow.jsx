import { X } from 'lucide-react'
import { Input } from '../ui/Input'

export function SubjectTopicsRow({ subject, onChange, onRemove, canRemove }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-white/10 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input
          label="Subject"
          placeholder="e.g. Organic Chemistry"
          value={subject.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div className="flex-1">
        <Input
          label="Topics"
          placeholder="comma, separated, topics"
          value={subject.topics}
          onChange={(e) => onChange({ topics: e.target.value })}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove subject"
          className="shrink-0 self-start rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 sm:mt-6"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
