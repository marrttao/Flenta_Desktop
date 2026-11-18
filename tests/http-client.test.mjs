import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('HTTP errors retain status and typed codes for session handling', async t => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
  try {
    const { apiRequest, ApiError } = await server.ssrLoadModule('/src/features/auth/api/httpClient.js')
    let body = null; let status = 401
    t.mock.method(globalThis, 'fetch', async () => Response.json(body, { status }))
    for (body of [null, [], 42, { code: {}, errors: 'bad', title: {} }]) {
      await assert.rejects(apiRequest('/api/profile'), error => error instanceof ApiError && error.status === 401 && error.code === null)
    }
    body = { errors: { amount: ['Invalid amount', null, {}] }, code: 'money.invalid' }; status = 400
    await assert.rejects(apiRequest('/api/accounts'), error => error.status === 400 && error.code === 'money.invalid' && error.message === 'Invalid amount')
    globalThis.fetch.mock.mockImplementation(async () => new Response('not-json', { status: 200 }))
    await assert.rejects(apiRequest('/api/profile'), error => error.code === 'client.invalid_response')
  } finally { await server.close() }
})
