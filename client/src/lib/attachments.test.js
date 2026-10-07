import test from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedAttachmentType } from './attachments.js'

test('attachment types allow common image and document formats but reject active formats', () => {
  assert.equal(isAllowedAttachmentType('image/png'), true)
  assert.equal(isAllowedAttachmentType('image/avif'), true)
  assert.equal(isAllowedAttachmentType('image/bmp'), true)
  assert.equal(isAllowedAttachmentType('application/pdf'), true)
  assert.equal(
    isAllowedAttachmentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    true,
  )
  assert.equal(isAllowedAttachmentType('image/heic'), false)
  assert.equal(isAllowedAttachmentType('image/svg+xml'), false)
  assert.equal(isAllowedAttachmentType('text/html'), false)
})
