import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotes,
  createNoteRequest,
  updateNoteRequest,
  deleteNoteRequest,
} from '../lib/api/notes.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const NOTES_KEY = ['notes']

export function useNotesQuery() {
  return useQuery({ queryKey: NOTES_KEY, queryFn: fetchNotes })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNoteRequest,
    onSuccess: (note) => {
      queryClient.setQueryData(NOTES_KEY, (notes = []) => [note, ...notes])
    },
    onError: () => showErrorToast("Couldn't create a new note"),
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNoteRequest,
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(NOTES_KEY, (notes = []) =>
        notes.map((n) => (n._id === updatedNote._id ? updatedNote : n)),
      )
    },
    // Deliberately no error toast here — autosave fires on every pause in
    // typing, and a toast per failed keystroke-save would be noisy.
    // NoteEditor's SaveStatusIndicator surfaces the failure inline instead.
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNoteRequest,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(NOTES_KEY, (notes = []) => notes.filter((n) => n._id !== deletedId))
      showSuccessToast('Note deleted')
    },
    onError: () => showErrorToast("Couldn't delete the note"),
  })
}
