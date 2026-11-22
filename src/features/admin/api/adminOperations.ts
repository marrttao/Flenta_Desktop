import type { AuthContextValue } from '../../auth/types'

/** Password confirmation is not part of the business command or its stored fingerprint. */
export function createAdminOperation(request: AuthContextValue['request'], newKey = () => crypto.randomUUID()) {
  let pending: { fingerprint: string; key: string } | null = null
  return async (path: string, body: Record<string, unknown>) => {
    const command = Object.fromEntries(Object.entries(body).filter(([name]) => name !== 'password'))
    const fingerprint = JSON.stringify([path, command])
    if (pending?.fingerprint !== fingerprint) pending = { fingerprint, key: newKey() }
    const operation = pending
    const result = await request(path, { method: 'POST', body, idempotencyKey: operation.key })
    if (pending === operation) pending = null
    return result
  }
}
