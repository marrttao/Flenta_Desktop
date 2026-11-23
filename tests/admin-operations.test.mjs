import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('privileged commands keep their business identity across confirmation retries', async t => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { createAdminOperation } = await server.ssrLoadModule('/src/features/admin/api/adminOperations.ts')
    await t.test('a lost response and a corrected confirmation password retain the original key', async () => {
      const calls = []
      let count = 0
      const operation = createAdminOperation(async (path, options) => {
        calls.push({ path, ...options })
        if (calls.length === 1) throw new Error('Connection lost after sending')
        return true
      }, () => 'key-' + ++count)
      const body = { amount: 25, reason: 'Fee correction', password: 'first-confirmation' }
      await assert.rejects(operation('/api/admin/clients/id/adjustments', body))
      await operation('/api/admin/clients/id/adjustments', { ...body, password: 'corrected-confirmation' })
      assert.equal(calls[0].idempotencyKey, calls[1].idempotencyKey)
      assert.equal(calls[1].body.password, 'corrected-confirmation')
      await operation('/api/admin/clients/id/adjustments', body)
      assert.notEqual(calls[1].idempotencyKey, calls[2].idempotencyKey)
    })
    await t.test('a different amount, target or audit reason is a new command', async () => {
      const keys = []
      let count = 0
      const operation = createAdminOperation(async (_path, options) => { keys.push(options.idempotencyKey); throw new Error('Unavailable') }, () => 'key-' + ++count)
      await assert.rejects(operation('/a', { amount: 1, reason: 'First reason', password: 'secret' }))
      await assert.rejects(operation('/a', { amount: 2, reason: 'First reason', password: 'secret' }))
      await assert.rejects(operation('/b', { amount: 2, reason: 'First reason', password: 'secret' }))
      await assert.rejects(operation('/b', { amount: 2, reason: 'Second reason', password: 'secret' }))
      assert.equal(new Set(keys).size, 4)
    })
    await t.test('returning to an earlier unresolved command preserves its original key', async () => {
      const keys = []
      let count = 0
      const operation = createAdminOperation(async (_path, options) => {
        keys.push(options.idempotencyKey)
        throw new Error('Response lost')
      }, () => 'key-' + ++count)
      await assert.rejects(operation('/adjustments', { amount: 10, reason: 'Correction', password: 'first' }))
      await assert.rejects(operation('/adjustments', { amount: 20, reason: 'Correction', password: 'first' }))
      await assert.rejects(operation('/adjustments', { amount: 10, reason: 'Correction', password: 'corrected' }))
      assert.deepEqual(keys, ['key-1', 'key-2', 'key-1'])
    })
    await t.test('concurrent submissions of the same command share one request', async () => {
      let calls = 0
      let release
      const gate = new Promise(resolve => { release = resolve })
      const operation = createAdminOperation(async () => { calls++; await gate; return true }, () => 'key')
      const first = operation('/adjustments', { amount: 10, password: 'secret' })
      const second = operation('/adjustments', { amount: 10, password: 'secret' })
      release()
      assert.deepEqual(await Promise.all([first, second]), [true, true])
      assert.equal(calls, 1)
    })
  } finally { await server.close() }
})
