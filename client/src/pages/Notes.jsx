import { useEffect } from 'react'
import { NotebookText } from 'lucide-react'
import { useNotesQuery, useCreateNote, useDeleteNote } from '../hooks/useNotes'
import { useNotesUIStore } from '../store/useNotesUIStore'
import { NotesSidebar } from '../components/notes/NotesSidebar'
import { NoteEditor } from '../components/notes/NoteEditor'
import { EmptyState } from '../components/ui/EmptyState'

export default function Notes() {
  const { data: notes = [], isLoading, isError } = useNotesQuery()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()

  const selectedNoteId = useNotesUIStore((s) => s.selectedNoteId)
  const isMobileEditorOpen = useNotesUIStore((s) => s.isMobileEditorOpen)
  const selectNote = useNotesUIStore((s) => s.selectNote)
  const closeMobileEditor = useNotesUIStore((s) => s.closeMobileEditor)
  const clearSelectedNote = useNotesUIStore((s) => s.clearSelectedNote)

  const selectedNote = notes.find((n) => n._id === selectedNoteId) ?? null

  // If the selected note disappears (deleted elsewhere, or a refetch no
  // longer contains it), fall back to the most recently edited note
  // instead of leaving the editor pointed at nothing.
  useEffect(() => {
    if (selectedNoteId && !selectedNote && notes.length > 0) {
      selectNote(notes[0]._id)
    } else if (selectedNoteId && notes.length === 0) {
      clearSelectedNote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, selectedNoteId])

  const handleCreateNote = () => {
    createNote.mutate({ title: '', body: '' }, { onSuccess: (note) => selectNote(note._id) })
  }

  const handleDeleteNote = (id) => {
    deleteNote.mutate(id, {
      onSuccess: () => {
        if (id === selectedNoteId) clearSelectedNote()
      },
    })
  }

  return (
    <div className="flex h-full">
      <div
        className={`w-full border-r border-gray-100 dark:border-white/10 sm:w-80 sm:shrink-0 ${
          isMobileEditorOpen ? 'hidden sm:block' : 'block'
        }`}
      >
        <NotesSidebar
          notes={notes}
          isLoading={isLoading}
          isError={isError}
          selectedNoteId={selectedNoteId}
          onSelectNote={selectNote}
          onCreateNote={handleCreateNote}
          isCreating={createNote.isPending}
        />
      </div>

      <div className={`min-w-0 flex-1 ${isMobileEditorOpen ? 'block' : 'hidden sm:block'}`}>
        {selectedNote ? (
          <>
            <button
              type="button"
              onClick={closeMobileEditor}
              className="border-b border-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400 sm:hidden"
            >
              ← Back to notes
            </button>
            <NoteEditor note={selectedNote} onDelete={handleDeleteNote} isDeleting={deleteNote.isPending} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={NotebookText}
              title={notes.length === 0 ? 'No notes yet' : 'Select a note'}
              description={
                notes.length === 0
                  ? 'Create your first note to get started.'
                  : 'Choose a note from the list, or create a new one.'
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
