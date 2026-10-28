import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, apiRequest } from '../src/features/auth/api/httpClient.js'

test('malformed error bodies preserve HTTP status for session recovery', async (t) => {
  for (const body of ['null', '"Unavailable"', '<html>Bad gateway</html>', '{"errors":42}']) {
    t.mock.method(globalThis, 'fetch', async () => new Response(body, { status: 401 }))
    await assert.rejects(apiRequest('/test'), (error) => error instanceof ApiError && error.status === 401)
    t.mock.restoreAll()
  }
})

test('validation errors retain readable messages and machine-readable codes', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    errors: { email: ['Invalid email'], password: ['Too short'] }, code: 'validation.failed',
  }, { status: 400 }))
  await assert.rejects(apiRequest('/test'), (error) =>
    error instanceof ApiError && error.status === 400 && error.code === 'validation.failed' &&
    error.message === 'Invalid email Too short')
})

test('requests preserve JSON, authentication and idempotency headers', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, 'Bearer token')
    assert.equal(options.headers['Idempotency-Key'], 'operation-1')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.equal(options.body, '{"amount":10}')
    return new Response(null, { status: 204 })
  })
  assert.equal(await apiRequest('/test', {
    method: 'POST', body: { amount: 10 }, token: 'token', idempotencyKey: 'operation-1',
  }), null)
})

test('network failures produce an ApiError with status zero', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch') })
  await assert.rejects(apiRequest('/test'), (error) => error instanceof ApiError && error.status === 0)
})
