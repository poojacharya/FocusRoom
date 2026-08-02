import { useMemo } from 'react'
import { useFocusSessionsQuery } from './useFocusSessions'
import { filterSessionsByRange, computeFocusStats, buildWeeklyChartData } from '../lib/utils/focusHistory'

/**
 * No new backend endpoint for history/stats/charting — this reads the
 * exact same GET /api/focus-sessions data the Focus page's "Recent
 * sessions" list already fetches (see hooks/useFocusSessions.js) and
 * derives everything client-side. Same personal-scale, no-pagination
 * assumption already established for Notes/Tasks/FocusSessions: fine at
 * the volume a real person using this app will ever produce. A dedicated
 * aggregation endpoint would only be worth adding if that assumption
 * stopped holding.
 */
export function useFocusHistoryData(range) {
  const { data: sessions = [], isLoading, isError } = useFocusSessionsQuery()

  const filteredSessions = useMemo(() => filterSessionsByRange(sessions, range), [sessions, range])
  const stats = useMemo(() => computeFocusStats(filteredSessions), [filteredSessions])
  // Deliberately built from the *unfiltered* session list — see the
  // comment on buildWeeklyChartData for why the chart ignores `range`.
  const chartData = useMemo(() => buildWeeklyChartData(sessions), [sessions])

  return { sessions: filteredSessions, stats, chartData, isLoading, isError }
}
