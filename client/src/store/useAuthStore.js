import { create } from 'zustand'

const REMEMBER_KEY = 'focusroom_remember_me'
const CACHED_USER_KEY = 'focusroom_cached_user'

function readCachedUser() {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheUser(user) {
  if (!user) return

  const serializableUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
  }

  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(serializableUser))
}

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuth: ({ user, accessToken, remember }) => {
    set({ user, accessToken, isAuthenticated: true })
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true')
      cacheUser(user)
    }
  },

  updateUserProfile: (updates) => {
    set((state) => {
      const nextUser = { ...(state.user || {}), ...updates }
      cacheUser(nextUser)
      return { user: nextUser }
    })
  },

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
