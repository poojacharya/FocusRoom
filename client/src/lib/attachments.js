const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024
const MAX_TOTAL_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
])
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
])

const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  avif: 'image/avif',
  bmp: 'image/bmp',
  jfif: 'image/jpeg',
  jpe: 'image/jpeg',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

function attachmentType(file) {
  const type = file.type?.toLowerCase()
  if (type && type !== 'application/octet-stream') {
    if (type === 'image/jpg' || type === 'image/pjpeg') return 'image/jpeg'
    return type
  }
  const extension = file.name.split('.').pop()?.toLowerCase()
  return MIME_BY_EXTENSION[extension] || ''
}

export function isAllowedAttachmentType(type) {
  const normalizedType = type.toLowerCase()
  return (
    ALLOWED_IMAGE_TYPES.has(normalizedType) ||
    ALLOWED_ATTACHMENT_TYPES.has(normalizedType)
  )
}

export function readAttachments(files) {
  const selectedFiles = Array.from(files)
  const totalBytes = selectedFiles.reduce((total, file) => total + file.size, 0)
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    throw new Error('Attachments must total 5 MB or less')
  }

  for (const file of selectedFiles) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`${file.name} is larger than the 4 MB per-file limit`)
    }
    if (!isAllowedAttachmentType(attachmentType(file))) {
      throw new Error(`${file.name} is not a supported image or document`)
    }
  }

  return Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () =>
            typeof reader.result === 'string'
              ? resolve({
                  name: file.name || 'Attachment',
                  type: attachmentType(file),
                  data: reader.result,
                })
              : reject(new Error(`Could not read ${file.name}`))
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

export function showAttachmentError(error) {
  return error instanceof Error ? error.message : 'Could not read attachments'
}
