import test from 'node:test'
import assert from 'node:assert/strict'
import { parseAmount } from '../src/features/banking/utils/banking.js'
import { createIdempotentRequest } from '../src/features/banking/api/bankingApi.js'

test('amounts accept cents and Ukrainian decimal commas without silently rounding', () => {
  assert.equal(parseAmount(' 12,50 '), 12.5)
  assert.equal(parseAmount('0.01'), 0.01)
  assert.equal(parseAmount('10000000000'), 10_000_000_000)
  for (const value of ['0', '-1', '1.001', '1e3', 'Infinity', '', '10,00,00', '10000000000.01']) {
    assert.throws(() => parseAmount(value), undefined, value)
  }
})

test('a retry after a lost response uses the original key, but a completed operation gets a new key', async () => {
  let sequence = 0
  const keys = []
  const submit = createIdempotentRequest(async (_path, options) => {
    keys.push(options.idempotencyKey)
    if (keys.length === 1) throw new Error('Connection lost after server commit')
    return { status: 'Completed' }
  }, () => `key-${++sequence}`)
  await assert.rejects(submit('/api/transactions/internal', { amount: 10 }))
  await submit('/api/transactions/internal', { amount: 10 })
  await submit('/api/transactions/internal', { amount: 10 })
  assert.deepEqual(keys, ['key-1', 'key-1', 'key-2'])
})

test('changing a failed operation payload or target creates a distinct key', async () => {
  let sequence = 0
  const keys = []
  const submit = createIdempotentRequest(async (_path, options) => {
    keys.push(options.idempotencyKey)
    throw new Error('Service unavailable')
  }, () => `key-${++sequence}`)
  await assert.rejects(submit('/api/accounts/a/top-ups', { amount: 10 }))
  await assert.rejects(submit('/api/accounts/a/top-ups', { amount: 11 }))
  await assert.rejects(submit('/api/accounts/b/top-ups', { amount: 11 }))
  assert.deepEqual(keys, ['key-1', 'key-2', 'key-3'])
})

test('a rejected operation is final and does not reuse its key for another attempt', async () => {
  let sequence = 0
  const keys = []
  const submit = createIdempotentRequest(async (_path, options) => {
    keys.push(options.idempotencyKey)
    return { status: 'Rejected', failureCode: 'account.insufficient_funds' }
  }, () => `key-${++sequence}`)
  await submit('/api/transactions/internal', { amount: 100 })
  await submit('/api/transactions/internal', { amount: 100 })
  assert.deepEqual(keys, ['key-1', 'key-2'])
})
