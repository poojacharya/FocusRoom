import { api } from '../axios'

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data.data // { user, accessToken }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data.data // { user, accessToken }
}

export async function logoutUser() {
  const { data } = await api.post('/auth/logout')
  return data.data
}

export async function refreshAccessToken() {
  const { data } = await api.post('/auth/refresh')
  return data.data // { accessToken } — backend doesn't return user here, see useAuthInit
}

// NOTE: these two endpoints do not exist on the backend yet — there's no
// /auth/forgot-password or /auth/reset-password route, controller, or email
// infrastructure as of this phase. Wiring them up now so the UI is ready
// the moment that backend work lands; until then these will 404.
export async function requestPasswordReset({ email }) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data.data
}

export async function resetPassword({ token, newPassword }) {
  const { data } = await api.post('/auth/reset-password', { token, newPassword })
  return data.data
}
