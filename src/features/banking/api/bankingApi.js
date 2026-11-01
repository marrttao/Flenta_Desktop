// Retain the same operation key after an ambiguous network failure. A changed
// payload is a new operation; a completed response releases the previous key.
export function createIdempotentRequest(request, newKey = () => crypto.randomUUID()) {
  let pending = null
  return async (path, body) => {
    const fingerprint = JSON.stringify([path, body])
    if (pending?.fingerprint !== fingerprint) pending = { fingerprint, key: newKey() }
    const operation = pending
    const result = await request(path, { method: 'POST', body, idempotencyKey: operation.key })
    if (pending === operation) pending = null
    return result
  }
}

export function createBankingApi(request) {
  const operation = createIdempotentRequest(request)
  return {
    snapshot: async (offset = 0) => {
      const [accounts, cards, transactions] = await Promise.all([
        request('/api/accounts'), request('/api/cards'),
        request(`/api/transactions?offset=${offset}&limit=20`),
      ])
      return { accounts, cards, transactions }
    },
    openAccount: () => request('/api/accounts', { method: 'POST' }),
    createCard: (accountId) => request('/api/cards', { method: 'POST', body: { accountId } }),
    changeCard: (id, action) => request(`/api/cards/${encodeURIComponent(id)}/${action}`, { method: 'POST' }),
    requisites: (id, password) => request(`/api/cards/${encodeURIComponent(id)}/requisites`, { method: 'POST', body: { password } }),
    topUp: (id, amount) => operation(`/api/accounts/${encodeURIComponent(id)}/top-ups`, { amount }),
    quote: (body) => request('/api/transactions/quote', { method: 'POST', body }),
    transfer: (byIban, body) => operation(`/api/transactions/${byIban ? 'iban' : 'internal'}`, body),
  }
}
