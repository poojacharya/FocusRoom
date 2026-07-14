import { create } from 'zustand'

const REMEMBER_KEY = 'focushub_remember_me'
const CACHED_USER_KEY = 'focushub_cached_user'

function readCachedUser() {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheUser(user) {
  // Only non-sensitive display fields — never the access token, which
  // stays in memory only (see lib/axios.js interceptors).
  localStorage.setItem(CACHED_USER_KEY, JSON.stringify({ name: user.name, email: user.email }))
}

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  // True while a login/register/logout request is in flight.
  isLoading: false,
  // Starts true; useAuthInit() flips it to false once the initial silent-
  // refresh check has resolved, so route guards don't flash the wrong
  // screen before we actually know whether the session is live.
  isInitializing: true,

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuth: ({ user, accessToken, remember }) => {
    set({ user, accessToken, isAuthenticated: true })
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true')
      cacheUser(user)
    }
  },

  // Called after a successful silent refresh on app boot — we already have
  // a (possibly cached) user in state, we're just confirming the session
  // is still live and updating the in-memory token.
  restoreSession: (accessToken) => set({ accessToken, isAuthenticated: true }),

  hydrateFromCache: () => {
    const cached = readCachedUser()
    if (cached) set({ user: cached })
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, isAuthenticated: false })
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(CACHED_USER_KEY)
  },

  setLoading: (isLoading) => set({ isLoading }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}))

export const shouldAttemptSilentRefresh = () => localStorage.getItem(REMEMBER_KEY) === 'true'
