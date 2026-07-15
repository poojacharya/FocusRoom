/**
 * Static mock data for the dashboard summary widgets. As of Phase 2B,
 * none of these have a real backend counterpart yet — routes/index.js
 * only mounts /health and /auth — so every fetcher below stays mocked,
 * per the "no placeholders unless the backend truly doesn't exist" rule.
 * Each comment below names the endpoint it will call once that feature's
 * own backend phase lands; hooks/useDashboardData.js call sites won't
 * need to change, only the fetcher bodies here.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Will call: GET /api/tasks/summary (Task Management phase)
export async function fetchTasksSummary() {
  await delay(400)
  return { completed: 4, pending: 3, total: 7 }
}

// Will call: GET /api/notes/summary (Notes Editor phase)
export async function fetchNotesSummary() {
  await delay(350)
  return {
    totalNotes: 12,
    lastEdited: { title: 'Organic Chemistry — Ch. 4', updatedAt: new Date().toISOString() },
  }
}

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

// Will call: GET /api/activity/recent (Productivity Dashboard phase)
export async function fetchRecentActivity() {
  await delay(500)
  return [
    { id: 'activity-1', label: 'Completed "Finish lab report"', timestamp: '2h ago' },
    { id: 'activity-2', label: 'Added a note to "Cell Biology"', timestamp: '5h ago' },
    { id: 'activity-3', label: 'Joined "Calculus study group"', timestamp: 'Yesterday' },
  ]
}
