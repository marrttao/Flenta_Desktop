import test from 'node:test'
import assert from 'node:assert/strict'
import { createSessionRefresh } from '../src/features/auth/utils/sessionRefresh.js'

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
function fixture(refresh) {
  const state = { session: { refreshToken: 'old' }, version: 1, accepted: [] }
  const execute = createSessionRefresh({ getSession: () => state.session, getVersion: () => state.version, refresh,
    acceptSession(value) { state.session = value; state.accepted.push(value) },
    endSession() { state.version++; state.session = null },
  })
  return { state, execute }
}

test('manual and automatic refresh share one provider call', async () => {
  const gate = deferred(); let calls = 0
  const { execute } = fixture(() => { calls++; return gate.promise })
  const a = execute(); const b = execute()
  await Promise.resolve(); assert.equal(calls, 1)
  gate.resolve({ refreshToken: 'new' })
  assert.deepEqual(await a, await b)
})

test('late refresh cannot restore a logged-out session', async () => {
  const gate = deferred(); const { state, execute } = fixture(() => gate.promise)
  const result = execute(); const rejected = assert.rejects(result, /Session was closed/)
  await Promise.resolve(); state.version++; state.session = null
  gate.resolve({ refreshToken: 'late' }); await rejected
  assert.deepEqual(state.accepted, [])
})

test('an old refresh finishing does not release the new account refresh', async () => {
  const old = deferred(); const next = deferred(); let calls = 0
  const { state, execute } = fixture(() => ++calls === 1 ? old.promise : next.promise)
  const first = execute(); const rejected = assert.rejects(first)
  await Promise.resolve(); state.version++; state.session = { refreshToken: 'second' }
  const second = execute(); await Promise.resolve()
  old.resolve({ refreshToken: 'late' }); await rejected
  const duplicate = execute(); assert.equal(second, duplicate); assert.equal(calls, 2)
  next.resolve({ refreshToken: 'current' }); await second
  assert.equal(state.session.refreshToken, 'current')
})

test('temporary refresh failures preserve the session; rejected credentials end it', async () => {
  for (const status of [0, 503, 400, 401, 403]) {
    const { state, execute } = fixture(async () => { throw Object.assign(new Error('Failure'), { status }) })
    await assert.rejects(execute())
    assert.equal(state.session === null, [400, 401, 403].includes(status))
  }
})
