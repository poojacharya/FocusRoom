import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '../lib/mock/notificationsMockData'

// Backed by lib/mock/notificationsMockData.js — no notifications endpoint
// exists on the backend yet. Swapping the fetcher body for a real
// `api.get('/notifications')` call is the only change needed later.
export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })
}
