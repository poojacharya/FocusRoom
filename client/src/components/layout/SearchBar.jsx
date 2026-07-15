import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSearch } from '../../hooks/useSearch'
import { SkeletonLine } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'

const MIN_QUERY_LENGTH = 2

/**
 * Debounced search input with a results dropdown. No backend search
 * endpoint exists yet (see hooks/useSearch.js), so the dropdown always
 * resolves to an honest "nothing to search yet" state instead of
 * fabricating results — the wiring itself (debounce, loading state,
 * open/close behavior) is real and won't need to change once a real
 * endpoint lands; only the EmptyState branch below gets replaced with an
 * actual results list.
 */
export function SearchBar() {
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebouncedValue(query, 300)
  const { isFetching } = useSearch(debouncedQuery)

  const showDropdown = isOpen && debouncedQuery.trim().length >= MIN_QUERY_LENGTH

  useEffect(() => {
    if (!isOpen) return undefined
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative hidden max-w-md flex-1 md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search tasks, notes, and more..."
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:focus:bg-white/10"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-gray-900">
          {isFetching ? (
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="h-4 w-1/2" />
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="Nothing to search yet"
              description="Search will return real results once tasks and notes exist."
            />
          )}
        </div>
      )}
    </div>
  )
}
