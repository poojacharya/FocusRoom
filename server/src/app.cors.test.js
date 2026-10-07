import test from 'node:test'
import assert from 'node:assert/strict'

process.env.NODE_ENV = 'test'
const { createApp } = await import('./app.js')

async function withServer(callback) {
  const server = createApp().listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  try {
    const { port } = server.address()
    await callback(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

test('API preflight allows the configured development origin with credentials', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    })

    assert.equal(response.status, 204)
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true')
  })
})

test('API rejects an unconfigured origin', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://untrusted.example',
        'Access-Control-Request-Method': 'GET',
      },
    })

    assert.equal(response.status, 403)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  })
})
