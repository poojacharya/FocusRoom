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
  const [status, setStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const lastSavedRef = useRef({ title: note?.title ?? '', body: note?.body ?? '' })
  const updateNote = useUpdateNote()

  const debouncedTitle = useDebouncedValue(title, 700)
  const debouncedBody = useDebouncedValue(body, 700)

  // Switching to a different note resets the draft to *that* note's saved
  // values — otherwise the previous note's in-progress text would bleed
  // into the newly selected one for a frame.
  useEffect(() => {
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    lastSavedRef.current = { title: note?.title ?? '', body: note?.body ?? '' }
    setStatus('saved')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?._id])

  const save = (nextTitle, nextBody) => {
    if (!note) return
    if (nextTitle === lastSavedRef.current.title && nextBody === lastSavedRef.current.body) return

    setStatus('saving')
    updateNote.mutate(
      { id: note._id, title: nextTitle, body: nextBody },
      {
        onSuccess: () => {
          lastSavedRef.current = { title: nextTitle, body: nextBody }
          setStatus('saved')
        },
        onError: () => setStatus('error'),
      },
    )
  }

  useEffect(() => {
    save(debouncedTitle, debouncedBody)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedBody, note?._id])

  return {
    title,
    setTitle,
    body,
    setBody,
    status,
    retry: () => save(title, body),
  }
}
