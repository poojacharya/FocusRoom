import { useQuery } from '@tanstack/react-query'
import { fetchSearchResults } from '../lib/mock/searchMockData'

const MIN_QUERY_LENGTH = 2

/**
 * Backed by lib/mock/searchMockData.js — no search endpoint exists on the
 * backend yet (see routes/index.js, which only mounts /health and
 * /auth). `enabled` keeps this from firing on an empty/too-short query;
 * pair with useDebouncedValue at the call site so it also doesn't fire on
 * every keystroke once the query is long enough.
 */
export function useSearch(query) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => fetchSearchResults(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
  })
}
