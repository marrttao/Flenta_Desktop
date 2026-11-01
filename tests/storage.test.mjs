import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('storage preserves values and limits clearing to its own keys', async (t) => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { StorageService, MemoryAdapter, StorageKeys } = await server.ssrLoadModule('/src/storage/index.ts')
    const adapter = new MemoryAdapter()
    const storage = new StorageService({ nonSensitive: adapter, sensitive: adapter })
    const key = StorageKeys.USER_CURRENCY_LIST
    const currencies = [{ code: 'USD', order: 0 }]

    await t.test('JSON values round trip', () => {
      storage.setItem(key, currencies)
      assert.deepEqual(storage.getItem(key), currencies)
    })

    await t.test('unserializable values do not overwrite existing data', () => {
      for (const value of [undefined, () => {}, Symbol('value')]) {
        storage.setItem(key, value)
        assert.deepEqual(storage.getItem(key), currencies)
      }
    })

    await t.test('invalid JSON is handled without throwing', (context) => {
      context.mock.method(console, 'warn', () => {})
      adapter.setItem(key, '{broken')
      assert.equal(storage.getItem(key), null)
    })

    await t.test('clearAll leaves unrelated application data intact', () => {
      storage.setItem(key, currencies)
      storage.setItem(StorageKeys.THEM, 'dark')
      adapter.setItem('another-app', 'keep')
      storage.clearAll()
      assert.equal(storage.getItem(key), null)
      assert.equal(storage.getItem(StorageKeys.THEM), null)
      assert.equal(adapter.getItem('another-app'), 'keep')
    })
  } finally {
    await server.close()
  }
})
