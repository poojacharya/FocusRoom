import { useEffect, useState } from 'react'

/**
 * Generic debounce hook — not search-specific. Reusable anywhere a value
 * needs to settle before triggering expensive work (search, autosave,
 * filtering, etc.).
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debouncedValue
}
