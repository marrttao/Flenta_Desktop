import test from 'node:test'
import assert from 'node:assert/strict'
import { currentMonthRange } from '../src/features/dashboard/model/dateRange.js'

test('monthly analytics uses the local date at a UTC month boundary', () => {
  const previous = process.env.TZ
  try {
    process.env.TZ = 'Europe/Kyiv'
    const now = new Date('2026-10-31T22:30:00Z')
    assert.deepEqual(currentMonthRange(now), { from: '2026-11-01', through: '2026-11-01' })
    assert.deepEqual(currentMonthRange(new Date('2026-12-31T22:30:00Z')), { from: '2027-01-01', through: '2027-01-01' })
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
})
