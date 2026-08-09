import { api } from '../axios'

export async function searchUsersRequest(query) {
  const { data } = await api.get('/friends/search', { params: { q: query } })
  return data.data // { _id, name, email, relationship, friendshipId?, requestId? }[]
}

export async function fetchFriends() {
  const { data } = await api.get('/friends')
  return data.data // { friendshipId, user, since }[]
}

export async function fetchIncomingRequests() {
  const { data } = await api.get('/friends/requests')
  return data.data // { requestId, user, createdAt }[]
}

export async function fetchSentRequests() {
  const { data } = await api.get('/friends/requests/sent')
  return data.data // { requestId, user, createdAt }[]
}

export async function sendFriendRequestApi(recipientId) {
  const { data } = await api.post('/friends/requests', { recipientId })
  return data.data
}

export async function acceptFriendRequestApi(requestId) {
  const { data } = await api.patch(`/friends/requests/${requestId}/accept`)
  return data.data
}

export async function rejectFriendRequestApi(requestId) {
  await api.patch(`/friends/requests/${requestId}/reject`)
  return requestId
}

export async function removeFriendApi(friendshipId) {
  await api.delete(`/friends/${friendshipId}`)
  return friendshipId
}
