/**
 * No search endpoint exists on the backend yet — routes/index.js only
 * mounts /health and /auth. This mock keeps SearchBar fully wired
 * (debounce, loading state, dropdown) without pretending there's real
 * content to search. Swap this for a real
 * `api.get('/search', { params: { q: query } })` call once a backend
 * search endpoint exists; useSearch.js won't need any other changes.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchSearchResults(query) {
  await delay(250)
  return [] // nothing to search yet — see comment above
}
