import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeGooglePayload } from './googleAuth.js'

test('normalizes a verified Google profile into app user fields', () => {
  const user = normalizeGooglePayload({
    sub: 'google-user-123',
    name: 'Ada Lovelace',
    email: 'ADA@EXAMPLE.COM',
    email_verified: true,
    picture: 'https://example.com/avatar.png',
  })

  assert.deepEqual(user, {
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    googleId: 'google-user-123',
    avatar: 'https://example.com/avatar.png',
  })
})

test('rejects unverified Google emails', () => {
  assert.throws(
    () =>
      normalizeGooglePayload({
        sub: 'google-user-456',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        email_verified: false,
      }),
    /verified/i,
  )
})
