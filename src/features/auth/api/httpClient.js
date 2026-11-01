const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5080').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, code) {
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
    const problem = await response.json().catch(() => ({}))
    const validation = problem.errors ? Object.values(problem.errors).flat().join(' ') : ''
    throw new ApiError(validation || problem.detail || problem.title || 'Запит не виконано.', response.status, problem.code)
  }
  if (response.status === 204) return null
  return response.json()
}
