import { useId, useRef, useState } from 'react'

export function FinanceForm({ children, submitLabel, onSubmit, onSuccess, disabled = false }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const attempts = useRef(new Map())
  const inFlight = useRef(false)

  return <form onSubmit={async (event) => {
    event.preventDefault()
    if (inFlight.current) return
    const data = new FormData(event.currentTarget)
    const fingerprint = JSON.stringify([...data.entries()])
    const key = attempts.current.get(fingerprint) || crypto.randomUUID()
    attempts.current.set(fingerprint, key)
    inFlight.current = true
    setPending(true); setError(''); setMessage('')
    try {
      const result = await onSubmit(data, key)
      attempts.current.delete(fingerprint)
      if (result?.status === 'Rejected') setError(`Операцію відхилено: ${result.failureCode}`)
      else setMessage(result?.savingsSkipReason
        ? 'Покупку оплачено. На відрахування в ціль забракло коштів.'
        : 'Виконано.')
      await onSuccess?.(result)
    } catch (failure) {
      setError(failure.message)
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }}>
    <fieldset disabled={pending || disabled}>{children}<button type="submit">{pending ? 'Зачекай…' : submitLabel}</button></fieldset>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
  </form>
}

export function AccountSelect({ accounts, name = 'accountId', label = 'Рахунок', exclude = null }) {
  const id = useId()
  return <p><label htmlFor={id}>{label}</label><br /><select id={id} name={name} required defaultValue="">
    <option value="" disabled>Обери рахунок</option>
    {accounts.filter((a) => a.id !== exclude).map((account) => <option key={account.id} value={account.id}>
      {account.currency} · {account.iban} · {account.balance.toFixed(2)}
    </option>)}
  </select></p>
}

export function AmountInput({ label = 'Сума', name = 'amount' }) {
  return <p><label>{label}<br /><input name={name} type="number" min="0.01" max="10000000000" step="0.01" required /></label></p>
}
