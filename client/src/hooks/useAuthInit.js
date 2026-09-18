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
 * refresh, so we dedupe the hydration with a module-level promise guard to avoid
 * rotating the same refresh cookie twice and accidentally logging the user out.
 */
export function useAuthInit() {
  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!shouldAttemptSilentRefresh()) {
        useAuthStore.getState().setInitializing(false)
        return
      }

      if (refreshHydrationPromise) {
        try {
          await refreshHydrationPromise
        } catch {
          // The shared refresh has already failed and cleared the session.
        }
        return
      }

      useAuthStore.getState().hydrateFromCache()

      refreshHydrationPromise = (async () => {
        try {
          const { accessToken } = await refreshAccessToken()
          if (!cancelled) {
            useAuthStore.getState().restoreSession(accessToken)
          }
        } catch {
          if (!cancelled) {
            useAuthStore.getState().clearAuth()
          }
        } finally {
          if (!cancelled) {
            useAuthStore.getState().setInitializing(false)
          }
        }
      })()

      try {
        await refreshHydrationPromise
      } finally {
        refreshHydrationPromise = null
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])
}