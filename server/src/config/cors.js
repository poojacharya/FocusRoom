const DEVELOPMENT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

export function createAllowedOrigins(
  clientUrls = '',
  isProduction = process.env.NODE_ENV === 'production',
) {
  const configuredOrigins = clientUrls
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      let url
      try {
        url = new URL(value)
      } catch {
        throw new Error(`Invalid CLIENT_URL value "${value}"; expected an absolute http(s) URL`)
      }

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Invalid CLIENT_URL value "${value}"; only http(s) URLs are supported`)
      }

      return url.origin
    })

  return [...new Set([...(isProduction ? [] : DEVELOPMENT_ORIGINS), ...configuredOrigins])]
}

export const allowedOrigins = createAllowedOrigins(process.env.CLIENT_URL || '')

export function isAllowedOrigin(origin, origins = allowedOrigins) {
  return !origin || origins.includes(origin)
}

export function corsOrigin(origin, callback) {
  if (isAllowedOrigin(origin)) {
    callback(null, true)
    return
  }

  callback(createBlockedOriginError(origin))
}

export function createBlockedOriginError(origin, service = 'CORS') {
  const error = new Error(`${service} blocked for origin: ${origin}`)
  error.statusCode = 403
  error.isOperational = true
  return error
}
