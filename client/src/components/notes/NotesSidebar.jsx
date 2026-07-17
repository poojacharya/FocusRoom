import { Plus, NotebookText } from 'lucide-react'
import { NoteListItem } from './NoteListItem'
import { EmptyState } from '../ui/EmptyState'
import { SkeletonLine } from '../ui/Skeleton'
import { Button } from '../ui/Button'

export function NotesSidebar({
  notes,
  isLoading,
  isError,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  isCreating,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-4 dark:border-white/10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Notes</h1>
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          className="px-3 py-1.5"
          onClick={onCreateNote}
          isLoading={isCreating}
          aria-label="New note"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {isLoading ? (
          <div className="space-y-2 px-2">
            <SkeletonLine className="h-14 w-full" />
            <SkeletonLine className="h-14 w-full" />
            <SkeletonLine className="h-14 w-full" />
          </div>
        ) : isError ? (
          <p className="px-2 text-sm text-gray-500 dark:text-gray-400">
            Couldn&apos;t load your notes right now.
          </p>
        ) : notes.length === 0 ? (
          <EmptyState
            icon={NotebookText}
            title="No notes yet"
            description="Create your first note to get started."
            action={
              <Button type="button" fullWidth={false} onClick={onCreateNote} isLoading={isCreating}>
                New note
              </Button>
            }
          />
        ) : (
          notes.map((note) => (
            <NoteListItem
              key={note._id}
              note={note}
              isActive={note._id === selectedNoteId}
              onSelect={onSelectNote}
            />
          ))
        )}
      </div>
    </div>
  )
}
