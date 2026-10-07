import { useEffect } from 'react'
import { useAuthStore, shouldAttemptSilentRefresh } from '../store/useAuthStore'
import { refreshAccessToken } from '../lib/api/auth.api'

let refreshHydrationPromise = null

/**
 * Runs once on app mount. If the person previously logged in with
 * "Remember me", we optimistically paint their cached name/email and try
 * to silently redeem the httpOnly refresh cookie for a fresh access token.
 * If that fails (cookie expired/revoked) or "Remember me" wasn't set, we
 * land in the logged-out state and the route guards take it from there.
 *
 * React 18 StrictMode can trigger the same effect twice during a single page
 * refresh, so both effects share the refresh request and independently hydrate
 * the store if they are still mounted when it completes.
 */
export function useAuthInit() {
  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!shouldAttemptSilentRefresh()) {
        useAuthStore.getState().setInitializing(false)
        return
      }

      useAuthStore.getState().hydrateFromCache()

      if (!refreshHydrationPromise) {
        let request
        request = refreshAccessToken().finally(() => {
          if (refreshHydrationPromise === request) refreshHydrationPromise = null
        })
        refreshHydrationPromise = request
      }

      try {
        const { accessToken } = await refreshHydrationPromise
        if (cancelled) return
        useAuthStore.getState().restoreSession(accessToken)
        const cachedUser = JSON.parse(localStorage.getItem('focusroom_cached_user') || 'null')
        if (cachedUser) useAuthStore.getState().setState({ user: cachedUser })
      } catch {
        if (!cancelled) useAuthStore.getState().clearAuth()
      } finally {
        if (!cancelled) useAuthStore.getState().setInitializing(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])
}