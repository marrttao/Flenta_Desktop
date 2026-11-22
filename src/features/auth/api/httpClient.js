const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5080').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiRequest(path, { method = 'GET', body, token, idempotencyKey } = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('Не вдалося підключитися до API. Спробуй пізніше.', 0)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const problem = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
    const validation = problem.errors && typeof problem.errors === 'object' && !Array.isArray(problem.errors)
      ? Object.values(problem.errors).flat().filter(value => typeof value === 'string' && value.trim()).join(' ') : ''
    const detail = typeof problem.detail === 'string' ? problem.detail.trim() : ''
    const title = typeof problem.title === 'string' ? problem.title.trim() : ''
    throw new ApiError(validation || detail || title || 'Запит не виконано.', response.status,
      typeof problem.code === 'string' ? problem.code : null)
  }
  if (response.status === 204) return null
  try { return await response.json() }
  catch { throw new ApiError('API повернув некоректну відповідь.', response.status, 'client.invalid_response') }
}
