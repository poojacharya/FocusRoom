import test from 'node:test'
import assert from 'node:assert/strict'
import { validateChatAttachments } from './studyRoomSocket.js'

test('room chat accepts valid embedded images and documents', () => {
  assert.equal(
    validateChatAttachments([
      { name: 'diagram.png', type: 'image/png', data: 'data:image/png;base64,aGVsbG8=' },
      { name: 'notes.pdf', type: 'application/pdf', data: 'data:application/pdf;base64,aGVsbG8=' },
    ]),
    true,
  )
})

test('room chat rejects mismatched types, unsafe data URLs, and excessive attachment counts', () => {
  assert.equal(
    validateChatAttachments([{ name: 'file.png', type: 'image/png', data: 'data:text/html;base64,aGVsbG8=' }]),
    false,
  )
  assert.equal(
    validateChatAttachments([{ name: 'file.png', type: 'image/jpeg', data: 'data:image/png;base64,aGVsbG8=' }]),
    false,
  )
  assert.equal(
    validateChatAttachments(Array.from({ length: 6 }, (_, index) => ({
      name: `${index}.png`,
      type: 'image/png',
      data: 'data:image/png;base64,aGVsbG8=',
    }))),
    false,
  )
})

test('room chat enforces an aggregate attachment size limit', () => {
  const largeBase64 = 'A'.repeat(7 * 1024 * 1024)

  assert.equal(
    validateChatAttachments([
      { name: 'large.png', type: 'image/png', data: `data:image/png;base64,${largeBase64}` },
    ]),
    false,
  )
})
