import { useEffect, useState } from 'react'
import { financeApi } from '../api/financeApi.js'
import { AccountSelect, AmountInput, FinanceForm } from './FinanceForm.jsx'

export function ExchangePanel({ request, accounts, refresh }) {
  const [rates, setRates] = useState(null)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState(null)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    let active = true
    financeApi.rates(request).then((value) => { if (active) setRates(value) })
      .catch((failure) => { if (active) setError(failure.message) })
    return () => { active = false }
  }, [request])
  useEffect(() => {
    if (!quote) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [quote])
  const expired = quote && now >= Date.parse(quote.expiresAt)
  return <section><h2>Валюта та обмін</h2>
    {error && <p role="alert">{error}</p>}
    {rates && <><p>Курси НБУ на {rates.date}. Гривень за одиницю валюти.</p><ul>
      {Object.entries(rates.uahPerUnit).map(([currency, rate]) => <li key={currency}>{currency}: {rate}</li>)}
    </ul></>}
    <FinanceForm submitLabel="Розрахувати обмін" disabled={accounts.length < 2} onSubmit={async (data) => {
      setQuote(null)
      const value = await financeApi.quote(request, { sourceAccountId: data.get('source'), destinationAccountId: data.get('destination'), amount: Number(data.get('amount')) })
      setNow(Date.now()); setQuote(value)
    }}>
      <AccountSelect accounts={accounts} name="source" label="З рахунку" />
      <AccountSelect accounts={accounts} name="destination" label="На рахунок в іншій валюті" /><AmountInput />
    </FinanceForm>
    {quote && <div><p>Списання: {quote.amount.toFixed(2)} {quote.sourceCurrency}. Отримаєш: {quote.receivedAmount.toFixed(2)} {quote.destinationCurrency}.</p>
      <p>Курс: {quote.rate}. Комісія: {quote.fee}. НБУ: {quote.rateDate}. Діє до {new Date(quote.expiresAt).toLocaleTimeString()}.</p>
      {expired && <p role="status">Розрахунок застарів. Отримай новий.</p>}
      <FinanceForm key={quote.id} submitLabel="Підтвердити обмін" disabled={expired} onSubmit={(_, key) =>
        financeApi.money(request, '/api/finance/exchanges', { quoteId: quote.id }, key)} onSuccess={async () => { setQuote(null); await refresh() }} />
    </div>}
  </section>
}
