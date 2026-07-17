import { formatRelativeTime } from '../../lib/utils/formatRelativeTime'

export function NoteListItem({ note, isActive, onSelect }) {
  const preview = (note.body || '').replace(/\s+/g, ' ').trim().slice(0, 80)

  return (
    <button
      type="button"
      onClick={() => onSelect(note._id)}
      className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
        isActive ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <p
        className={`truncate text-sm font-medium ${
          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {note.title?.trim() || 'Untitled note'}
      </p>
      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
        {preview || 'No content yet'}
      </p>
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {formatRelativeTime(note.updatedAt)}
      </p>
    </button>
  )
}
