import { useEffect } from 'react'
import { useAuthStore, shouldAttemptSilentRefresh } from '../store/useAuthStore'
import { refreshAccessToken } from '../lib/api/auth.api'

/**
 * Runs once on app mount. If the person previously logged in with
 * "Remember me", we optimistically paint their cached name/email and try
 * to silently redeem the httpOnly refresh cookie for a fresh access token.
 * If that fails (cookie expired/revoked) or "Remember me" wasn't set, we
 * land in the logged-out state and the route guards take it from there.
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
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])
}
