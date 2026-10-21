import { useState } from 'react'

export function AuthForm({ children, onSubmit, submitLabel, successMessage }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    setSuccess(false)
    try {
      await onSubmit(data)
      setSuccess(true)
    } catch (failure) {
      setError(failure.message || 'Не вдалося виконати дію.')
    } finally { setBusy(false) }
  }

  return <form onSubmit={submit} aria-busy={busy}>
    {error && <p role="alert">{error}</p>}
    {success && successMessage && <p role="status">{successMessage}</p>}
    <fieldset disabled={busy}>
      {children}
      <button type="submit">{busy ? 'Зачекай…' : submitLabel}</button>
    </fieldset>
  </form>
}
