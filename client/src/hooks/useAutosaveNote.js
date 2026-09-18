import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'
import { useUpdateNote } from './useNotes'

/**
 * Local title/body draft state for whichever note is open, auto-saved via
 * a debounced PATCH once the person pauses typing. Skips the network call
 * entirely if nothing has actually changed since the last successful save.
 */
export function useAutosaveNote(note) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [documents, setDocuments] = useState(note?.documents ?? [])
  const [status, setStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const lastSavedRef = useRef({ title: note?.title ?? '', body: note?.body ?? '', documents: note?.documents ?? [] })
  const updateNote = useUpdateNote()

  const debouncedTitle = useDebouncedValue(title, 700)
  const debouncedBody = useDebouncedValue(body, 700)
  const debouncedDocuments = useDebouncedValue(documents, 700)

  // Switching to a different note resets the draft to *that* note's saved
  // values — otherwise the previous note's in-progress text would bleed
  // into the newly selected one for a frame.
  useEffect(() => {
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    setDocuments(note?.documents ?? [])
    lastSavedRef.current = { title: note?.title ?? '', body: note?.body ?? '', documents: note?.documents ?? [] }
    setStatus('saved')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?._id])

  const save = (nextTitle, nextBody, nextDocuments) => {
    if (!note) return
    const sameAsLastSaved =
      nextTitle === lastSavedRef.current.title &&
      nextBody === lastSavedRef.current.body &&
      JSON.stringify(nextDocuments) === JSON.stringify(lastSavedRef.current.documents)

    if (sameAsLastSaved) return

    setStatus('saving')
    updateNote.mutate(
      { id: note._id, title: nextTitle, body: nextBody, documents: nextDocuments },
      {
        onSuccess: () => {
          lastSavedRef.current = { title: nextTitle, body: nextBody, documents: nextDocuments }
          setStatus('saved')
        },
        onError: () => setStatus('error'),
      },
    )
  }

  useEffect(() => {
    save(debouncedTitle, debouncedBody, debouncedDocuments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedBody, debouncedDocuments, note?._id])

  return {
    title,
    setTitle,
    body,
    setBody,
    documents,
    setDocuments,
    status,
    retry: () => save(title, body, documents),
  }
}
