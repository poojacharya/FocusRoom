/**
 * Static mock data for the dashboard widgets that still have no real
 * backend counterpart. Tasks summary, Notes summary, and Recent
 * Activity are no longer read from here — they're derived client-side
 * from the real GET /api/tasks and GET /api/notes data in
 * hooks/useDashboardData.js. Study streak and upcoming study-room
 * sessions remain mocked until a streak model and a "scheduled
 * session" concept exist on the backend; each fetcher below still
 * names the endpoint it will call once that feature's own backend
 * phase lands.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Will call: GET /api/analytics/streak (Productivity Dashboard phase)
export async function fetchStudyStreak() {
  await delay(300)
  return { currentStreak: 6, longestStreak: 14 }
}

// Will call: GET /api/rooms/upcoming (Study Rooms phase)
export async function fetchUpcomingSessions() {
  await delay(450)
  return [
    { id: 'session-1', title: 'Calculus study group', startsAt: '4:00 PM', participants: 5 },
    {
      id: 'session-2',
      title: 'Physics problem set review',
      startsAt: 'Tomorrow, 10:00 AM',
      participants: 3,
    },
  ]
}
