/**
 * Static mock data for the Phase 2A dashboard shell (goal: "Data can be
 * mocked for now"). Every fetcher returns a Promise so the React Query
 * hooks in hooks/useDashboardData.js behave exactly like they will once
 * real endpoints exist — swapping the body of each fetcher for an
 * `api.get(...)` call (see lib/axios.js) is the only change needed later.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchTasksSummary() {
  await delay(400)
  return { completed: 4, pending: 3, total: 7 }
}

export async function fetchNotesSummary() {
  await delay(350)
  return {
    totalNotes: 12,
    lastEdited: { title: 'Organic Chemistry — Ch. 4', updatedAt: new Date().toISOString() },
  }
}

export async function fetchStudyStreak() {
  await delay(300)
  return { currentStreak: 6, longestStreak: 14 }
}

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

export async function fetchRecentActivity() {
  await delay(500)
  return [
    { id: 'activity-1', label: 'Completed "Finish lab report"', timestamp: '2h ago' },
    { id: 'activity-2', label: 'Added a note to "Cell Biology"', timestamp: '5h ago' },
    { id: 'activity-3', label: 'Joined "Calculus study group"', timestamp: 'Yesterday' },
  ]
}
