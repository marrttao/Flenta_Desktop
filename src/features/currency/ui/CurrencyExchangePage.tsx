import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../../dashboard/model/useDashboard'
import { bankingError, parseAmount } from '../../banking/utils/banking.js'
import { financeApi } from '../../finance/api/financeApi.js'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Feedback, SoonBadge } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { RateChart } from './RateChart'
import styles from './Exchange.module.css'

interface Rates { date: string; uahPerUnit: Record<string, number> }
interface ExchangeQuote {
  id: string; sourceCurrency: string; destinationCurrency: string; amount: number; receivedAmount: number
  rate: number; rateDate: string; fee: number; expiresAt: string
}

function uahPer(rates: Rates | null, currency: string) {
  return currency === 'UAH' ? 1 : rates?.uahPerUnit[currency]
}

export function CurrencyExchangePage() {
  const m = useDashboard()
  const t = m.text
  const [rates, setRates] = useState<Rates | null>(null)
  const [ratesError, setRatesError] = useState('')
  const [pick, setPick] = useState({ source: '', destination: '' })
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<ExchangeQuote | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    financeApi.rates(m.request).then((value: unknown) => { if (active) setRates(value as Rates) })
      .catch((failure: unknown) => { if (active) setRatesError(bankingError(failure)) })
    return () => { active = false }
  }, [m.request])

  useEffect(() => {
    if (!quote) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [quote])

  const source = m.accounts.find(a => a.id === pick.source) ?? m.activeAccount ?? m.accounts[0]
  const destination = m.accounts.find(a => a.id === pick.destination && a.id !== source?.id && a.currency !== source?.currency)
    ?? m.accounts.find(a => a.currency !== source?.currency)
  const targets = m.accounts.filter(a => a.currency !== source?.currency)
  const fromRate = source && uahPer(rates, source.currency)
  const toRate = destination && uahPer(rates, destination.currency)
  const pairRate = fromRate && toRate ? fromRate / toRate : null
  const expired = quote ? now >= Date.parse(quote.expiresAt) : false
  const secondsLeft = quote ? Math.max(0, Math.round((Date.parse(quote.expiresAt) - now) / 1000)) : 0
  const bars = Object.entries(rates?.uahPerUnit ?? {}).map(([currency, value]) => ({ currency, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  const rateNumber = (value: number) => new Intl.NumberFormat(m.locale, { maximumFractionDigits: 4 }).format(value)

  function choose(next: Partial<typeof pick>) { setPick(current => ({ ...current, ...next })); setQuote(null) }

  async function review() {
    setQuote(null)
    await m.run(async () => {
      if (!source || !destination) throw new Error(t('Open accounts in two different currencies first.', 'Спочатку відкрий рахунки у двох різних валютах.'))
      const value = await financeApi.quote(m.request, { sourceAccountId: source.id, destinationAccountId: destination.id, amount: parseAmount(amount) }) as ExchangeQuote
      setNow(Date.now()); setQuote(value)
    }, '')
  }

  async function confirm() {
    if (!quote || expired) return
    if (await m.run(() => m.operation('/api/finance/exchanges', { quoteId: quote.id }), t('Exchange completed.', 'Обмін виконано.'))) { setQuote(null); setAmount('') }
  }

  return <WorkspaceLayout section="exchange" title={t('Currency exchange', 'Обмін валют')} subtitle={t('Move money between your currency accounts at the official rate.', 'Переводь кошти між валютними рахунками за офіційним курсом.')}>
    <Feedback error={m.error} notice={m.notice}/>
    {m.loaded && targets.length === 0 && <p className={ui.notice}>{t('You need accounts in two different currencies.', 'Потрібні рахунки у двох різних валютах.')} <Link to="/">{t('Open a USD or EUR account on Home.', 'Відкрий рахунок у USD або EUR на головній.')}</Link></p>}

    <div className={styles.pair}>
      <section className={`${styles.side} ${styles.sideFrom}`}>
        <div className={styles.sideHead}><h2>{t('From account', 'З рахунку')}</h2>{source && <span className={styles.currencyBadge}>{source.currency}</span>}</div>
        <p className={styles.balance}>{source ? m.format(source.balance, source.currency) : '—'}</p>
        <label className={ui.field}>{t('Account', 'Рахунок')}
          <select value={source?.id || ''} disabled={m.disabled || !m.accounts.length} onChange={e => choose({ source: e.target.value, destination: '' })}>
            {m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}
          </select>
        </label>
        <label className={ui.field}>{t('Choice of amount', 'Сума обміну')}
          <input value={amount} inputMode="decimal" placeholder="0,00" autoComplete="off" disabled={m.disabled || !destination} onChange={e => { setAmount(e.target.value); setQuote(null) }}/>
        </label>
      </section>
      <button type="button" className={styles.swap} disabled={m.disabled || !destination} aria-label={t('Swap accounts', 'Поміняти рахунки місцями')}
        onClick={() => destination && source && choose({ source: destination.id, destination: source.id })}><Icon name="swap"/></button>
      <section className={styles.side}>
        <div className={styles.sideHead}><h2>{t('To account', 'На рахунок')}</h2>{destination && <span className={styles.currencyBadge}>{destination.currency}</span>}</div>
        <p className={styles.balance}>{destination ? m.format(destination.balance, destination.currency) : '—'}</p>
        <label className={ui.field}>{t('Account', 'Рахунок')}
          <select value={destination?.id || ''} disabled={m.disabled || !targets.length} onChange={e => choose({ destination: e.target.value })}>
            {!targets.length && <option value="">{t('No account in another currency', 'Немає рахунку в іншій валюті')}</option>}
            {targets.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}
          </select>
        </label>
        <div className={ui.field}>{t('You receive', 'Ти отримаєш')}
          <div className={styles.received} aria-live="polite">{quote ? m.format(quote.receivedAmount, quote.destinationCurrency) : '—'}</div>
        </div>
      </section>
    </div>

    <section className={styles.rates} aria-labelledby="exchange-rates-title">
      <div>
        <h2 id="exchange-rates-title" className={styles.ratesTitle}>{t('Exchange rate of money', 'Курси валют')}</h2>
        {ratesError ? <p role="alert" className={`${ui.feedback} ${ui.feedbackError}`}>{ratesError}</p>
          : bars.length ? <RateChart bars={bars} format={rateNumber} caption={`${t('UAH per unit · NBU', 'Гривень за одиницю · НБУ')} · ${rates?.date}`}/>
            : <p className={ui.notice} role="status">{t('Loading rates…', 'Завантажуємо курси…')}</p>}
      </div>
      <div className={`${ui.panel} ${styles.quote}`}>
        <p className={styles.rate}>{source && destination && pairRate ? `1 ${source.currency} = ${rateNumber(pairRate)} ${destination.currency}` : t('Choose two currencies', 'Обери дві валюти')}</p>
        <dl className={styles.terms}>
          <dt>{t('Limits', 'Ліміти')}<SoonBadge/></dt><dd>—</dd>
          <dt>{t('Commission', 'Комісія')}</dt><dd>{quote ? m.format(quote.fee, quote.sourceCurrency) : '—'}</dd>
          <dt>{t('Quoted rate', 'Курс розрахунку')}</dt><dd>{quote ? `${rateNumber(quote.rate)} · ${quote.rateDate}` : '—'}</dd>
        </dl>
        <div className={styles.quoteActions}>
          {quote && (expired ? <span className={styles.expired} role="status">{t('This quote has expired. Review the exchange again.', 'Розрахунок застарів. Розрахуй обмін ще раз.')}</span>
            : <span className={ui.small + ' ' + ui.muted}>{t('Quote valid for', 'Розрахунок дійсний ще')} {secondsLeft} {t('s', 'с')}</span>)}
          {quote && !expired
            ? <button type="button" className={ui.buttonPrimary} disabled={m.disabled} onClick={() => void confirm()}>{t('Confirm exchange', 'Підтвердити обмін')} · {m.format(quote.amount, quote.sourceCurrency)}</button>
            : <button type="button" className={ui.buttonPrimary} disabled={m.disabled || !destination || !amount} onClick={() => void review()}>{t('Review exchange', 'Розрахувати обмін')}</button>}
        </div>
      </div>
    </section>
  </WorkspaceLayout>
}
