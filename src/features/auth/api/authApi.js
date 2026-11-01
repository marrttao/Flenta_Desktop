import { apiRequest } from './httpClient.js'

export const authApi = {
  register: (body) => apiRequest('/api/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/api/auth/login', { method: 'POST', body }),
  refresh: (refreshToken) => apiRequest('/api/auth/refresh', { method: 'POST', body: { refreshToken } }),
  exchange: (code, codeVerifier) => apiRequest('/api/auth/exchange', { method: 'POST', body: { code, codeVerifier } }),
  recover: (body) => apiRequest('/api/auth/recover', { method: 'POST', body }),
  logout: (token) => apiRequest('/api/auth/logout', { method: 'POST', token }),
}
