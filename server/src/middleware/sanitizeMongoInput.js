/**
 * Drop-in replacement for `express-mongo-sanitize`.
 *
 * express-mongo-sanitize@2.x sanitizes NoSQL-injection payloads by
 * reassigning req.body/req.params/req.query wholesale
 * (e.g. `req.query = sanitizedQuery`). On Express 4.21+ (this project
 * resolves to 4.22.2), `req.query` is a getter-only accessor with no
 * setter, so that reassignment throws:
 *
 *   TypeError: Cannot set property query of #<IncomingMessage>
 *   which has only a getter
 *
 * That middleware is mounted globally in app.js, before every route —
 * so it was throwing on every single request, including
 * POST /api/auth/register and POST /api/auth/login, which is why both
 * were failing.
 *
 * This middleware provides the same NoSQL-injection protection
 * (stripping any object key that starts with '$' or contains '.') but
 * mutates req.body / req.params / req.query IN PLACE instead of
 * reassigning them, so it works on both old and new Express versions.
 */
function sanitizeInPlace(value) {
  if (Array.isArray(value)) {
    value.forEach(sanitizeInPlace)
    return value
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key]
        continue
      }
      sanitizeInPlace(value[key])
    }
  }

  return value
}

export function sanitizeMongoInput(req, res, next) {
  if (req.body) sanitizeInPlace(req.body)
  if (req.params) sanitizeInPlace(req.params)
  if (req.query) sanitizeInPlace(req.query)
  next()
}
