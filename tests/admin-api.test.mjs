import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('administrative API contracts', async (t) => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { adminApi } = await server.ssrLoadModule('/src/features/admin/api/adminApi.ts')
    await t.test('access requires a positive server decision', async () => {
      await adminApi.access(async () => ({ canAccess: true }))
      for (const value of [null, {}, { canAccess: false }, { canAccess: 'true' }])
        await assert.rejects(adminApi.access(async () => value))
      const forbidden = Object.assign(new Error('Forbidden'), { status: 403 })
      await assert.rejects(adminApi.access(async () => { throw forbidden }), error => error === forbidden)
    })
    await t.test('email searches are encoded and pagination is sent to the server', async () => {
      const calls = []
      const result = { items: [], total: 0, totalClients: 12, page: 2, pageSize: 8 }
      assert.equal(await adminApi.clients(async path => { calls.push(path); return result }, 'alex+bank@example.com&role=admin', 2), result)
      const url = new URL(calls[0], 'http://localhost')
      assert.equal(url.pathname, '/api/admin/clients')
      assert.equal(url.searchParams.get('email'), 'alex+bank@example.com&role=admin')
      assert.equal(url.searchParams.get('page'), '2')
      assert.equal(url.searchParams.get('pageSize'), '8')
      assert.equal(url.searchParams.get('role'), null)
    })
    await t.test('corrupt successful responses cannot masquerade as an empty client list', async () => {
      for (const value of [null, [], {}, { items: [], total: 0 },
        { items: [], total: -1, totalClients: 1, page: 1, pageSize: 8 },
        { items: [null], total: 1, totalClients: 1, page: 1, pageSize: 8 }])
        await assert.rejects(adminApi.clients(async () => value, '', 1))
    })
    await t.test('overview rejects invalid counts, dates and transaction amounts', async () => {
      const good = { totalClients: 1, verifiedKycClients: 1, todayTransactions: 0,
        date: '2026-11-21', updatedAt: '2026-11-21T12:00:00Z', recentTransactions: [] }
      assert.equal(await adminApi.overview(async () => good), good)
      for (const value of [null, { ...good, totalClients: NaN }, { ...good, date: 'not-a-date' },
        { ...good, recentTransactions: [null] }, { ...good, recentTransactions: [{ amount: Infinity }] }])
        await assert.rejects(adminApi.overview(async () => value))
    })
  } finally { await server.close() }
})
