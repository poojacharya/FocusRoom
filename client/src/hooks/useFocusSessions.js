import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchFocusSessions,
  createFocusSessionRequest,
  updateFocusSessionRequest,
  deleteFocusSessionRequest,
} from '../lib/api/focusSessions.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const FOCUS_SESSIONS_KEY = ['focusSessions']

export function useFocusSessionsQuery() {
  return useQuery({ queryKey: FOCUS_SESSIONS_KEY, queryFn: fetchFocusSessions })
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFocusSessionRequest,
    onSuccess: (session) => {
      queryClient.setQueryData(FOCUS_SESSIONS_KEY, (sessions = []) => [session, ...sessions])
    },
    // No toast here — the timer engine (useFocusTimerEngine) shows its
    // own success/failure messaging tailored to "session saved" vs
    // "couldn't save", since a raw mutation-level toast would fire
    // before the UI has reset back to idle.
  })
}

// Not wired into any component yet — see the note in
// lib/api/focusSessions.api.js. Ready for a future "edit a past
// session" feature.
export function useUpdateFocusSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateFocusSessionRequest,
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(FOCUS_SESSIONS_KEY, (sessions = []) =>
        sessions.map((s) => (s._id === updatedSession._id ? updatedSession : s)),
      )
    },
    onError: () => showErrorToast("Couldn't update the session"),
  })
}

export function useDeleteFocusSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFocusSessionRequest,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(FOCUS_SESSIONS_KEY, (sessions = []) =>
        sessions.filter((s) => s._id !== deletedId),
      )
      showSuccessToast('Session deleted')
    },
    onError: () => showErrorToast("Couldn't delete the session"),
  })
}
