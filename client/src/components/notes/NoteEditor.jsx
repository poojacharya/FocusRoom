import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { useAutosaveNote } from '../../hooks/useAutosaveNote'
import { SaveStatusIndicator } from './SaveStatusIndicator'

export function NoteEditor({ note, onDelete, isDeleting }) {
  const { title, setTitle, body, setBody, status, retry } = useAutosaveNote(note)
  const titleRef = useRef(null)

  // Auto-focus the title on a brand-new (empty-title) note so typing works
  // immediately. Switching to an existing note doesn't steal focus — the
  // person may just be browsing, not about to retitle it.
  useEffect(() => {
    if (note && !note.title) {
      titleRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?._id])

  if (!note) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 dark:border-white/10">
        <SaveStatusIndicator status={status} onRetry={retry} />
        <button
          type="button"
          onClick={() => onDelete(note._id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 dark:text-gray-50 dark:placeholder:text-gray-600"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="mt-4 flex-1 w-full resize-none bg-transparent text-base leading-relaxed text-gray-700 outline-none placeholder:text-gray-300 dark:text-gray-200 dark:placeholder:text-gray-600"
        />
      </div>
    </div>
  )
}
