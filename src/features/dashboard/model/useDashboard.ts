import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useTranslation } from '../../localization'
import { createBankingApi, createIdempotentRequest } from '../../banking/api/bankingApi.js'
import { bankingError } from '../../banking/utils/banking.js'
import { financeApi } from '../../finance/api/financeApi.js'
import { currentMonthRange } from './dateRange.js'

export interface Account { id: string; iban: string; currency: string; balance: number }
export interface Card { id: string; accountId: string; maskedNumber: string; status: string; expiryMonth: number; expiryYear: number }
export interface Transaction {
  id: string; kind: string; status: string; amount: number; fee: number; currency: string; createdAt: string
  sourceAccountId: string | null; destinationAccountId: string | null; destinationIban: string | null; failureCode: string | null
  saved?: number; cashback?: number; savingsSkipReason?: string | null
}
export interface Goal {
  id: string; fundingAccountId: string; name: string; currency: string; target: number; balance: number
  progressPercent: number; deadline: string | null; mode: 'Off' | 'Percentage' | 'RoundUp'
  percentage: number; roundUpStep: number; archived: boolean
}
export interface Analytics { currencies: { currency: string; expenses: number; purchases: number }[] }
export interface TransferQuote { amount: number; fee: number; total: number; currency: string; sufficientFunds: boolean }
export type DashboardAction = 'topup' | 'transfer' | 'accounts' | 'cards' | 'purchase' | 'help' | null
const empty = { accounts: [] as Account[], cards: [] as Card[], transactions: [] as Transaction[] }

export function useDashboard() {
  const { user, request, logout } = useAuth()
  const { language } = useTranslation()
  const text = useCallback((en: string, uk: string) => language === 'uk' ? uk : en, [language])
  const locale = { en: 'en-GB', uk: 'uk-UA', pl: 'pl-PL', de: 'de-DE' }[language]
  const format = useCallback((value: number, currency: string) => new Intl.NumberFormat(locale, {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(value), [locale])
  const bank = useMemo(() => createBankingApi(request), [request])
  const operation = useMemo(() => createIdempotentRequest(request), [request])
  const [data, setData] = useState(empty)
  const [goals, setGoals] = useState<Goal[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [goalsError, setGoalsError] = useState('')
  const [analyticsError, setAnalyticsError] = useState('')
  const [notice, setNotice] = useState('')
  const [accountId, setAccountId] = useState('')
  const [cardId, setCardId] = useState('')
  const [offset, setOffset] = useState(0)
  const [action, setActionState] = useState<DashboardAction>(null)
  const generation = useRef(0)
  const inFlight = useRef(false)
  const selectedCard = data.cards.find(c => c.id === cardId) ?? data.cards[0]
  const activeAccount = data.accounts.find(a => a.id === accountId) ?? data.accounts.find(a => a.id === selectedCard?.accountId) ?? data.accounts[0]
  const activeCard = data.cards.find(c => c.accountId === activeAccount?.id && c.id === cardId)
    ?? data.cards.find(c => c.accountId === activeAccount?.id)
  const disabled = !user || busy || loading

  const refresh = useCallback(async () => {
    if (!user) return
    const current = ++generation.current
    setLoading(true)
    const { from, through } = currentMonthRange()
    const results = await Promise.allSettled([
      bank.snapshot(offset), financeApi.goals(request), financeApi.analytics(request, from, through),
    ])
    if (current !== generation.current) return
    const [snapshot, savings, spending] = results
    if (snapshot.status === 'fulfilled') { setData(snapshot.value as typeof empty); setLoaded(true); setError('') }
    else setError(bankingError(snapshot.reason))
    if (savings.status === 'fulfilled') { setGoals(savings.value as Goal[]); setGoalsError('') }
    else setGoalsError(bankingError(savings.reason))
    if (spending.status === 'fulfilled') { setAnalytics(spending.value as Analytics); setAnalyticsError('') }
    else setAnalyticsError(bankingError(spending.reason))
    setLoading(false)
  }, [user, bank, request, offset])

  useEffect(() => {
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])

  async function run(task: () => Promise<unknown>, success: string) {
    if (inFlight.current || !user) return false
    inFlight.current = true
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await task() as { status?: string; failureCode?: string; savingsSkipReason?: string } | undefined
      if (result?.status === 'Rejected') {
        await refresh()
        setError(bankingError({ code: result.failureCode, message: text('The operation was declined.', 'Операцію відхилено.') }))
        return false
      }
      setNotice(result?.savingsSkipReason
        ? text('Purchase completed. There were not enough funds for the savings contribution.', 'Покупку оплачено. На відрахування в ціль забракло коштів.') : success)
      await refresh()
      return true
    } catch (failure) {
      setError(bankingError(failure))
      return false
    } finally { setBusy(false); inFlight.current = false }
  }

  function selectAccount(id: string) { setAccountId(id); setCardId('') }
  function selectCard(card: Card) { setAccountId(card.accountId); setCardId(card.id) }
  function clearFeedback() { setError(''); setNotice('') }
  function setAction(value: DashboardAction) {
    if (value) clearFeedback()
    setActionState(value)
  }
  return { ...data, user, request, logout, bank, operation, finance: financeApi, goals, analytics,
    loading, loaded, busy, disabled, error, setError, goalsError, analyticsError, notice, offset, setOffset,
    activeAccount, activeCard, selectAccount, selectCard, action, setAction, clearFeedback, refresh, run, format, locale, text }
}
export type DashboardModel = ReturnType<typeof useDashboard>
