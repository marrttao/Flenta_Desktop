export const kycApi = {
  status: (request) => request('/api/kyc'),
  refresh: (request) => request('/api/kyc/refresh', { method: 'POST' }),
  session: (request) => request('/api/kyc/session', { method: 'POST' }),
}
