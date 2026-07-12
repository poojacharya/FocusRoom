import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/User.model.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
} from '../utils/jwt.js'

const REFRESH_COOKIE_NAME = 'refreshToken'
// Scoped to /api/auth so the cookie is never sent on unrelated API calls.
const REFRESH_COOKIE_PATH = '/api/auth'

function refreshCookieOptions(expires) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    // Cross-site deployments (separate client/API domains) need 'none' + secure.
    // Same-site local dev (Vite proxy) works fine with 'lax'.
    sameSite: isProduction ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    ...(expires ? { expires } : {}),
  }
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(expiresAt))
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user._id)
  const refreshToken = signRefreshToken(user._id)
  const expiresAt = getRefreshTokenExpiryDate()

  user.pruneExpiredRefreshTokens()
  user.addRefreshToken(hashToken(refreshToken), expiresAt)
  await user.save()

  return { accessToken, refreshToken, expiresAt }
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  const user = new User({ name, email, password })
  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken, expiresAt)

  res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken }, 'Account created successfully'))
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password +refreshTokens',
  )
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken, expiresAt)

  res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Login successful'))
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!token) {
    throw new ApiError(401, 'Refresh token missing')
  }

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    clearRefreshCookie(res)
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  const user = await User.findById(payload.sub).select('+refreshTokens')
  const presentedHash = hashToken(token)

  // If the hash isn't on the user's record, this token was already rotated
  // (or forged) — reject rather than silently re-issuing. This is what
  // makes rotation actually detect reuse/replay.
  if (!user || !user.hasRefreshToken(presentedHash)) {
    clearRefreshCookie(res)
    throw new ApiError(401, 'Refresh token has been revoked')
  }

  user.removeRefreshToken(presentedHash)
  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken, expiresAt)

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'))
})

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]

  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      const user = await User.findById(payload.sub).select('+refreshTokens')
      if (user) {
        user.removeRefreshToken(hashToken(token))
        await user.save()
      }
    } catch {
      // Token already invalid/expired — nothing to revoke server-side,
      // just fall through and clear the cookie below.
    }
  }

  clearRefreshCookie(res)
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
})
