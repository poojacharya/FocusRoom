import { api } from '../axios'

export async function fetchAnalytics() {
  const { data } = await api.get('/analytics')
  // { totalTasks, completedTasks, pendingTasks, totalFocusSeconds,
  //   completedFocusSessions, dailyFocusActivity, dailyTaskCompletion }
  return data.data
}
