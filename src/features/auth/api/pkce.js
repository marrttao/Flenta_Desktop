const storageKey = 'flenta.auth.pkce'
const lifetime = 60 * 60 * 1000

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function startPkce() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  // Only the temporary PKCE verifier is persisted, never access/refresh tokens.
  localStorage.setItem(storageKey, JSON.stringify({ verifier, createdAt: Date.now() }))
  return base64Url(new Uint8Array(digest))
}

export function getVerifier() {
  let stored
  try { stored = JSON.parse(localStorage.getItem(storageKey)) } catch { /* handled below */ }
  if (!stored?.verifier || !Number.isFinite(stored.createdAt) || Date.now() - stored.createdAt > lifetime) {
    localStorage.removeItem(storageKey)
    throw new Error('Відкрий лист у браузері, де створював запит, або запроси нове посилання.')
  }
  return stored.verifier
}

export function clearVerifier() {
  localStorage.removeItem(storageKey)
}
