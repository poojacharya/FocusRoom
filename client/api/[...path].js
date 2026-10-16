import http from 'node:http'
import https from 'node:https'

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function filterHopByHopHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !HOP_BY_HOP_HEADERS.has(name.toLowerCase())),
  )
}

export default function handler(req, res) {
  const configuredApiUrl = process.env.FOCUSROOM_API_URL
  if (!configuredApiUrl) {
    res.statusCode = 500
    res.end('FOCUSROOM_API_URL is not configured')
    return
  }

  let target
  try {
    const apiOrigin = new URL(configuredApiUrl)
    if (
      !['http:', 'https:'].includes(apiOrigin.protocol) ||
      apiOrigin.username ||
      apiOrigin.password ||
      apiOrigin.pathname !== '/' ||
      apiOrigin.search ||
      apiOrigin.hash
    ) {
      throw new Error('FOCUSROOM_API_URL must be an HTTP(S) origin without credentials or a path')
    }

    target = new URL(req.url, apiOrigin)
    if (target.origin !== apiOrigin.origin || !target.pathname.startsWith('/api/')) {
      res.statusCode = 400
      res.end('Invalid API proxy path')
      return
    }
  } catch (error) {
    console.error('Invalid FOCUSROOM_API_URL configuration:', error)
    res.statusCode = 500
    res.end('Invalid FOCUSROOM_API_URL configuration')
    return
  }

  const transport = target.protocol === 'https:' ? https : http
  const upstream = transport.request(
    target,
    {
      method: req.method,
      headers: filterHopByHopHeaders(req.headers),
    },
    (upstreamResponse) => {
      res.writeHead(
        upstreamResponse.statusCode || 502,
        filterHopByHopHeaders(upstreamResponse.headers),
      )
      upstreamResponse.pipe(res)
    },
  )

  upstream.on('error', (error) => {
    console.error('FocusRoom API proxy request failed:', error)
    if (!res.headersSent) {
      res.statusCode = 502
      res.end('FocusRoom API is unavailable')
    } else {
      res.destroy(error)
    }
  })

  req.pipe(upstream)
}

export const config = { api: { bodyParser: false } }
