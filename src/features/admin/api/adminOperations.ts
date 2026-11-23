import type { AuthContextValue } from '../../auth/types'

/** Password confirmation is not part of the business command or its stored fingerprint. */
export function createAdminOperation(request: AuthContextValue['request'], newKey = () => crypto.randomUUID()) {
  const pending = new Map<string, { key: string; promise?: Promise<unknown> }>()
  return async (path: string, body: Record<string, unknown>) => {
    const command = Object.fromEntries(Object.entries(body).filter(([name]) => name !== 'password'))
    const fingerprint = JSON.stringify([path, command])
    let operation = pending.get(fingerprint)
    if (!operation) { operation = { key: newKey() }; pending.set(fingerprint, operation) }
    if (operation.promise) return operation.promise
    const current = operation
    const promise = request(path, { method: 'POST', body, idempotencyKey: current.key })
      .then(result => { pending.delete(fingerprint); return result })
      .finally(() => { current.promise = undefined })
    current.promise = promise
    return promise
  }
}
