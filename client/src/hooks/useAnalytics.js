import { useQuery } from '@tanstack/react-query'
import { fetchAnalytics } from '../lib/api/analytics.api'

export function useAnalyticsQuery() {
  return useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics })
}
