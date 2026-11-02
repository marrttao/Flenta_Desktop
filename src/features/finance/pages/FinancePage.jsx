import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/components/authContext.js'
import { financeApi } from '../api/financeApi.js'
import { AccountsPanel } from '../components/AccountsPanel.jsx'
import { ExchangePanel } from '../components/ExchangePanel.jsx'
import { GoalsPanel } from '../components/GoalsPanel.jsx'
import { PurchasesPanel } from '../components/PurchasesPanel.jsx'
import { AnalyticsPanel } from '../components/AnalyticsPanel.jsx'

export function FinancePage() {
  const { request } = useAuth()
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const refresh = useCallback(() => {
    const current = ++generation.current
    return Promise.all([
        financeApi.accounts(request), financeApi.cards(request), financeApi.goals(request), financeApi.cashback(request),
      ]).then(([accounts, cards, goals, cashback]) => {
      if (current !== generation.current) return
      setData({ accounts, cards, goals, cashback }); setAnalytics(null); setError('')
    }).catch((failure) => { if (current === generation.current) setError(failure.message) })
  }, [request])
  useEffect(() => {
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])

  return <section><h1>Фінанси</h1>
    {error && <p role="alert">{error}</p>}
    <button type="button" onClick={refresh}>Оновити дані</button>
    {!data && !error && <p role="status">Завантаження…</p>}
    {data && <>
      <AccountsPanel request={request} accounts={data.accounts} refresh={refresh} />
      <ExchangePanel request={request} accounts={data.accounts} refresh={refresh} />
      <GoalsPanel request={request} accounts={data.accounts} goals={data.goals} refresh={refresh} />
      <PurchasesPanel request={request} accounts={data.accounts} cards={data.cards} cashback={data.cashback} refresh={refresh} />
      <AnalyticsPanel request={request} analytics={analytics} setAnalytics={setAnalytics} />
    </>}
  </section>
}
