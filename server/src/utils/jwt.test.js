import test from 'node:test'
import assert from 'node:assert/strict'

const tenDaysMs = 10 * 24 * 60 * 60 * 1000

test('refresh tokens default to a 10-day lifetime', async () => {
  delete process.env.JWT_REFRESH_EXPIRES_IN
  const { getRefreshTokenExpiryDate } = await import(new URL('./jwt.js?test=10d', import.meta.url).href)
  const now = Date.now()
  const expiry = getRefreshTokenExpiryDate().getTime()
  const delta = expiry - now

  assert.ok(Math.abs(delta - tenDaysMs) < 5000, `Expected ~${tenDaysMs}ms, got ${delta}ms`)
})
