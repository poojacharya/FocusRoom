import { X } from 'lucide-react'
import { Input } from '../ui/Input'

export function SubjectTopicsRow({ subject, onChange, onRemove, canRemove }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Study subject</p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove subject"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1.4fr]">
        <div>
          <Input
            label="Subject"
            placeholder="e.g. Organic Chemistry"
            value={subject.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <Input
            label="Topics"
            placeholder="comma, separated, topics"
            value={subject.topics}
            onChange={(e) => onChange({ topics: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
