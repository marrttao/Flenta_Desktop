import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('currency and storage regressions', async (t) => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { StorageService, MemoryAdapter, StorageKeys } = await server.ssrLoadModule('/src/storage/index.ts')
    const { isUserCurrencyList, reorderUserCurrencies } = await server.ssrLoadModule('/src/features/currency/utils/userCurrencies.ts')
    const { useCrossRate } = await server.ssrLoadModule('/src/features/currency/hooks/useCrossRate.ts')
    const original = [{ code: 'USD', order: 0 }, { code: 'EUR', order: 1 }, { code: 'GBP', order: 2 }]

    await t.test('stored currency lists reject malformed data and duplicates', () => {
      assert.equal(isUserCurrencyList(original), true)
      assert.equal(isUserCurrencyList([]), true)
      for (const value of [null, {}, 'USD', [null], [{ code: 'USD' }],
        [{ code: 'usd', order: 0 }], [{ code: 'EUR', order: -1 }],
        [{ code: 'USD', order: 0.5 }], [original[0], original[0]]]) {
        assert.equal(isUserCurrencyList(value), false, JSON.stringify(value))
      }
    })

    await t.test('reordering ignores duplicates and unknown codes, and retains omitted currencies', () => {
      const snapshot = structuredClone(original)
      assert.deepEqual(reorderUserCurrencies(original, ['GBP', 'GBP', 'XXX']), [
        { code: 'GBP', order: 0 }, { code: 'USD', order: 1 }, { code: 'EUR', order: 2 },
      ])
      assert.deepEqual(reorderUserCurrencies(original, []), original)
      assert.deepEqual(reorderUserCurrencies(original, ['GBP', 'EUR', 'USD']).map(item => item.code), ['GBP', 'EUR', 'USD'])
      assert.deepEqual(original, snapshot)
    })

    await t.test('unsupported JSON values preserve the existing stored value', () => {
      const adapter = new MemoryAdapter()
      const storage = new StorageService({ nonSensitive: adapter, sensitive: adapter })
      storage.setItem(StorageKeys.USER_CURRENCY_LIST, original)
      for (const value of [undefined, () => {}, Symbol('unsupported')]) {
        storage.setItem(StorageKeys.USER_CURRENCY_LIST, value)
        assert.deepEqual(storage.getItem(StorageKeys.USER_CURRENCY_LIST), original)
      }
      adapter.setItem('unrelated', 'keep')
      storage.clearAll()
      assert.equal(storage.getItem(StorageKeys.USER_CURRENCY_LIST), null)
      assert.equal(adapter.getItem('unrelated'), 'keep')
    })

    await t.test('cross rates reject invalid amounts, invalid rates and overflow', () => {
      function calculate(amount, from, to, rates) {
        let result
        function Probe() {
          result = useCrossRate(amount, from, to, rates)
          return null
        }
        renderToStaticMarkup(createElement(Probe))
        return result
      }
      assert.equal(calculate(100, 'USD', 'EUR', { USD: 1, EUR: 0.9 }), 90)
      assert.equal(calculate(100, 'USD', 'USD', { USD: 1 }), 100)
      for (const amount of [NaN, Infinity, -1, 0]) {
        assert.equal(calculate(amount, 'USD', 'EUR', { USD: 1, EUR: 0.9 }), null)
      }
      for (const rate of [undefined, 0, -1, NaN, Infinity]) {
        assert.equal(calculate(100, 'USD', 'EUR', { USD: rate, EUR: 0.9 }), null)
        assert.equal(calculate(100, 'USD', 'EUR', { USD: 1, EUR: rate }), null)
      }
      assert.equal(calculate(Number.MAX_VALUE, 'USD', 'EUR', { USD: 1, EUR: 2 }), null)
      assert.equal(calculate(100, 'USD', 'EUR', null), null)
    })
  } finally {
    await server.close()
  }
})
