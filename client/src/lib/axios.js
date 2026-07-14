import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
})

// Attach the in-memory access token to every outgoing request.
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Silent refresh-on-401: the access token is short-lived (15m by default).
// If a request fails with 401, try exactly once to refresh it using the
// httpOnly cookie before giving up and clearing the session. Concurrent
// 401s share a single in-flight refresh call instead of racing each other.
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')

    if (status !== 401 || isAuthEndpoint || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise = refreshPromise || api.post('/auth/refresh')
      const { data } = await refreshPromise
      refreshPromise = null

      const newAccessToken = data.data.accessToken
      useAuthStore.getState().setAccessToken(newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      refreshPromise = null
      useAuthStore.getState().clearAuth()
      return Promise.reject(refreshError)
    }
  },
)
