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

/**
 * BUG FIX (refresh token rotation, silently-lost writes):
 *
 * This used to load the full user document, mutate `refreshTokens` as an
 * in-memory array via instance methods, and call user.save() to persist
 * the whole array back in one write. That's a read-modify-write race: if
 * two refresh requests happen close together — e.g. React 18 StrictMode
 * double-invokes effects in dev, so a single page load can fire two
 * /auth/refresh calls a few milliseconds apart, both carrying the same
 * cookie — both can load the *same* starting array before either has
 * saved. Each appends its own new token to its own private in-memory
 * copy; whichever .save() lands second overwrites the array wholesale,
 * silently discarding the other request's token — even though that
 * request already received a 200 and a Set-Cookie for it. The next time
 * that "valid-looking" cookie is presented, its hash simply isn't in the
 * database, so it's rejected as "revoked" — confusing, since nothing
 * actually reused or leaked it; it was overwritten by its own sibling.
 *
 * Fix: use MongoDB's own atomic array operators ($push / $pull) directly
 * against the collection instead of round-tripping through an in-memory
 * copy of the whole array. Each operator is applied atomically by
 * MongoDB, so concurrent calls can no longer clobber each other's writes.
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken(user._id)
  const refreshToken = signRefreshToken(user._id)
  const expiresAt = getRefreshTokenExpiryDate()

  // Housekeeping: drop anything already expired. This has to be a
  // separate call — MongoDB doesn't allow $pull and $push against the
  // same array path within a single update document.
  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { expiresAt: { $lte: new Date() } } } },
  )
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: { hashedToken: hashToken(refreshToken), expiresAt } } },
  )

  return { accessToken, refreshToken, expiresAt }
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  const user = new User({ name, email, password })
  // Must exist in the collection before issueTokenPair's $push can target
  // it by _id — updateOne() against a not-yet-inserted document matches
  // nothing.
  await user.save()

  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken, expiresAt)

  res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken }, 'Account created successfully'))
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
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

  const presentedHash = hashToken(token)

  // Atomically check-and-revoke the presented hash in a single database
  // call: the filter only matches a document if this exact hash is still
  // present, and $pull removes it as part of that same operation. Two
  // concurrent requests presenting the same token can no longer both
  // "pass" the check — only one can possibly match-and-pull a given hash;
  // the other gets null back here and is correctly treated as revoked,
  // instead of both racing to overwrite the same in-memory snapshot.
  const user = await User.findOneAndUpdate(
    { _id: payload.sub, 'refreshTokens.hashedToken': presentedHash },
    { $pull: { refreshTokens: { hashedToken: presentedHash } } },
    { new: true },
  )

  if (!user) {
    clearRefreshCookie(res)
    throw new ApiError(401, 'Refresh token has been revoked')
  }

  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken, expiresAt)

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'))
})

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]

  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await User.updateOne(
        { _id: payload.sub },
        { $pull: { refreshTokens: { hashedToken: hashToken(token) } } },
      )
    } catch {
      // Token already invalid/expired — nothing to revoke server-side,
      // just fall through and clear the cookie below.
    }
  }

  clearRefreshCookie(res)
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
})
