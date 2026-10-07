import test from 'node:test'
import assert from 'node:assert/strict'
import { createAllowedOrigins, createBlockedOriginError, isAllowedOrigin } from './cors.js'

test('development origins and normalized configured origins are allowed', () => {
  const origins = createAllowedOrigins('https://focusroom.example/, https://preview.example', false)

  assert.deepEqual(origins, [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://focusroom.example',
    'https://preview.example',
  ])
})

test('production origins exclude localhost unless explicitly configured', () => {
  const origins = createAllowedOrigins('https://focusroom.example', true)

  assert.deepEqual(origins, ['https://focusroom.example'])
})

test('only exact configured origins and origin-less requests are accepted', () => {
  const origins = createAllowedOrigins('https://focusroom.example')

  assert.equal(isAllowedOrigin('https://focusroom.example', origins), true)
  assert.equal(isAllowedOrigin(undefined, origins), true)
  assert.equal(isAllowedOrigin('https://other.example', origins), false)
  assert.equal(isAllowedOrigin('https://focusroom.example.evil', origins), false)
})

test('invalid client origins fail configuration clearly', () => {
  assert.throws(() => createAllowedOrigins('focusroom.example'), /absolute http\(s\) URL/)
  assert.throws(() => createAllowedOrigins('ftp://focusroom.example'), /only http\(s\) URLs/)
})

test('blocked origins produce an operational forbidden error', () => {
  const error = createBlockedOriginError('https://other.example')

  assert.equal(error.statusCode, 403)
  assert.equal(error.isOperational, true)
})
