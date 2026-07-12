import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined in the environment')
  return secret
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined in the environment')
  return secret
}

/**
 * Minimal '15m' / '30d' style duration parser so we can compute a concrete
 * expiry Date for the DB record without pulling in an extra dependency.
 */
function parseDurationToMs(duration) {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration)
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}" (expected e.g. "15m", "30d")`)
  }
  const value = Number(match[1])
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }
  return value * unitMs[match[2]]
}

export function getRefreshTokenExpiryDate() {
  return new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRES_IN))
}

// --- Access tokens -----------------------------------------------------
// Short-lived, returned in the response body, sent back as a Bearer header.
// Never persisted server-side.

export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId), type: 'access' }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, getAccessSecret())
  if (payload.type !== 'access') {
    throw new Error('Unexpected token type')
  }
  return payload
}

// --- Refresh tokens ------------------------------------------------------
// Long-lived, delivered only via httpOnly cookie. Only a hash of these is
// ever stored (see User.model.js). The `type` claim stops an access token
// from ever being usable as a refresh token or vice versa.

export function signRefreshToken(userId) {
  const jti = crypto.randomBytes(16).toString('hex')
  return jwt.sign({ sub: String(userId), type: 'refresh', jti }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, getRefreshSecret())
  if (payload.type !== 'refresh') {
    throw new Error('Unexpected token type')
  }
  return payload
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
