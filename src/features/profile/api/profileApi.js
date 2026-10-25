export function getProfile(request) {
  return request('/api/profile')
}

export function updateProfile(request, displayName) {
  return request('/api/profile', { method: 'PUT', body: { displayName } })
}
