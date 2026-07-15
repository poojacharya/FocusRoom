/**
 * No notifications endpoint exists on the backend yet. This mock keeps
 * NotificationBell fully wired (unread badge, dropdown, empty state)
 * without inventing fake notifications. Swap for a real
 * `api.get('/notifications')` call once a backend endpoint exists;
 * useNotifications.js won't need any other changes.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchNotifications() {
  await delay(300)
  return { items: [], unreadCount: 0 }
}
