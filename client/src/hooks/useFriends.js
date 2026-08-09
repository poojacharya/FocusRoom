import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  searchUsersRequest,
  fetchFriends,
  fetchIncomingRequests,
  fetchSentRequests,
  sendFriendRequestApi,
  acceptFriendRequestApi,
  rejectFriendRequestApi,
  removeFriendApi,
} from '../lib/api/friends.api'
import { showErrorToast, showSuccessToast } from '../lib/toast'

const FRIENDS_KEY = ['friends']
const INCOMING_REQUESTS_KEY = ['friends', 'requests', 'incoming']
const SENT_REQUESTS_KEY = ['friends', 'requests', 'sent']
const SEARCH_KEY_PREFIX = ['friends', 'search']

// Matches the MIN_QUERY_LENGTH convention already used by
// hooks/useSearch.js (dashboard search) — no query fires below 2 chars.
const MIN_QUERY_LENGTH = 2

export function useFriendsQuery() {
  return useQuery({ queryKey: FRIENDS_KEY, queryFn: fetchFriends })
}

export function useIncomingRequestsQuery() {
  return useQuery({ queryKey: INCOMING_REQUESTS_KEY, queryFn: fetchIncomingRequests })
}

export function useSentRequestsQuery() {
  return useQuery({ queryKey: SENT_REQUESTS_KEY, queryFn: fetchSentRequests })
}

export function useUserSearch(query) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: [...SEARCH_KEY_PREFIX, trimmed],
    queryFn: () => searchUsersRequest(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
  })
}

/**
 * Every relationship-changing mutation below invalidates the same set of
 * query keys rather than patching a single cache entry in place. This is
 * a deliberate departure from the patch-in-place convention used by
 * Notes/Tasks/FocusSessions (see hooks/useTasks.js's patchTaskInCache):
 * there, each mutation only ever affects one list. Here, a single action
 * can affect up to three lists at once — e.g. accepting a request moves
 * a person out of "incoming requests" and into "friends", *and* flips
 * their badge in any currently-open search results. Reproducing that
 * cross-list bookkeeping by hand in every mutation would duplicate the
 * same logic four times over for a marginal win; invalidating the
 * affected keys keeps each mutation to one responsibility at the cost of
 * a refetch instead of an instant patch.
 */
function invalidateFriendData(queryClient) {
  queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
  queryClient.invalidateQueries({ queryKey: INCOMING_REQUESTS_KEY })
  queryClient.invalidateQueries({ queryKey: SENT_REQUESTS_KEY })
  queryClient.invalidateQueries({ queryKey: SEARCH_KEY_PREFIX })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendFriendRequestApi,
    onSuccess: () => {
      invalidateFriendData(queryClient)
      showSuccessToast('Friend request sent')
    },
    onError: (error) => showErrorToast(error?.response?.data?.message || "Couldn't send friend request"),
  })
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acceptFriendRequestApi,
    onSuccess: () => {
      invalidateFriendData(queryClient)
      showSuccessToast('Friend request accepted')
    },
    onError: () => showErrorToast("Couldn't accept the request"),
  })
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectFriendRequestApi,
    onSuccess: () => {
      invalidateFriendData(queryClient)
      showSuccessToast('Friend request declined')
    },
    onError: () => showErrorToast("Couldn't decline the request"),
  })
}

export function useRemoveFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeFriendApi,
    onSuccess: () => {
      invalidateFriendData(queryClient)
      showSuccessToast('Friend removed')
    },
    onError: () => showErrorToast("Couldn't remove this friend"),
  })
}
