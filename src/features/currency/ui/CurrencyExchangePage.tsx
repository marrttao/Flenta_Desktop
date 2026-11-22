import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, type Account } from '../../dashboard/model/useDashboard'
import { bankingError, parseAmount } from '../../banking/utils/banking.js'
import { financeApi } from '../../finance/api/financeApi.js'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Feedback, SoonBadge } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { RateChart } from './RateChart'
import styles from './Exchange.module.css'
import flagUah from './assets/flag-uah.png'
import flagUsd from './assets/flag-usd.png'

interface Rates { date: string; uahPerUnit: Record<string, number> }
interface ExchangeQuote {
  id: string; sourceCurrency: string; destinationCurrency: string; amount: number; receivedAmount: number
  rate: number; rateDate: string; fee: number; expiresAt: string
}

const flags: Record<string, string> = { UAH: flagUah, USD: flagUsd }

function Flag({ currency }: { currency: string }) {
  return flags[currency] ? <img className={styles.flag} src={flags[currency]} width={30} height={20} alt={currency}/> : <span className={styles.flagCode}>{currency}</span>
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
  // Quote the foreign currency against the other side, as in the design ("1 USD = 45,24 UAH").
  const [base, counter] = source?.currency === 'UAH' ? [destination, source] : [source, destination]
  const baseRate = base && uahPer(rates, base.currency)
  const counterRate = counter && uahPer(rates, counter.currency)
  const pairRate = baseRate && counterRate ? baseRate / counterRate : null
  const expired = quote ? now >= Date.parse(quote.expiresAt) : false
  const secondsLeft = quote ? Math.max(0, Math.round((Date.parse(quote.expiresAt) - now) / 1000)) : 0
  const bars = Object.entries(rates?.uahPerUnit ?? {}).map(([currency, value]) => ({ currency, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  const rateNumber = (value: number) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 4 }).format(value)

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

  const pickerLabel = (account: Account) => `${account.currency} · …${account.iban.slice(-6)} · ${m.format(account.balance, account.currency)}`

  return <WorkspaceLayout section="exchange" title={t('Currency exchange', 'Обмін валют')}>
    <Feedback error={m.error} notice={m.notice}/>
    {m.loaded && targets.length === 0 && <p className={ui.notice}>{t('You need accounts in two different currencies.', 'Потрібні рахунки у двох різних валютах.')} <Link to="/cards">{t('Open a USD or EUR account on Cards.', 'Відкрий рахунок у USD або EUR на сторінці «Картки».')}</Link></p>}

    <div className={styles.pair}>
      <section className={`${styles.side} ${styles.sideFrom}`}>
        <div className={styles.sideHead}><h2 className={styles.sideTitle}>{t('From card', 'З картки')}</h2>
          {source && <label className={styles.flagPicker} title={t('Change account', 'Змінити рахунок')}><Flag currency={source.currency}/>
            <select aria-label={t('Account to exchange from', 'Рахунок списання')} value={source.id} disabled={m.disabled} onChange={e => choose({ source: e.target.value, destination: '' })}>
              {m.accounts.map(a => <option key={a.id} value={a.id}>{pickerLabel(a)}</option>)}
            </select></label>}
        </div>
        <p className={styles.balance}>{source ? m.format(source.balance, source.currency) : '—'}</p>
        <label className={styles.amountLabel} htmlFor="exchange-amount">{t('Choice of amount', 'Сума обміну')}</label>
        <div className={styles.amountField}>
          <input id="exchange-amount" value={amount} inputMode="decimal" placeholder="0,00" autoComplete="off" disabled={m.disabled || !destination} onChange={e => { setAmount(e.target.value); setQuote(null) }}/>
          {source && <Flag currency={source.currency}/>}
        </div>
      </section>
      <button type="button" className={styles.swap} disabled={m.disabled || !destination} aria-label={t('Swap accounts', 'Поміняти рахунки місцями')}
        onClick={() => destination && source && choose({ source: destination.id, destination: source.id })}><Icon name="swap" size={30}/></button>
      <section className={styles.side}>
        <div className={styles.sideHead}><h2 className={styles.sideTitle}>{t('To card', 'На картку')}</h2>
          {destination && <label className={styles.flagPicker} title={t('Change account', 'Змінити рахунок')}><Flag currency={destination.currency}/>
            <select aria-label={t('Account to exchange to', 'Рахунок зарахування')} value={destination.id} disabled={m.disabled} onChange={e => choose({ destination: e.target.value })}>
              {targets.map(a => <option key={a.id} value={a.id}>{pickerLabel(a)}</option>)}
            </select></label>}
        </div>
        <p className={styles.balance}>{destination ? m.format(destination.balance, destination.currency) : '—'}</p>
        <span className={styles.amountLabel}>{t('Choice of amount', 'Сума обміну')}</span>
        <div className={styles.amountField} aria-live="polite">
          <output>{quote ? new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(quote.receivedAmount) : '—'}</output>
          {destination && <Flag currency={destination.currency}/>}
        </div>
      </section>
    </div>

    <h2 className={styles.ratesTitle}>{t('Exchange rate of money', 'Курс валют')}</h2>
    <section className={styles.rates} aria-label={t('Exchange rate of money', 'Курс валют')}>
      <div className={styles.chartArea}>
        {ratesError ? <p role="alert" className={`${ui.feedback} ${ui.feedbackError}`}>{ratesError}</p>
          : bars.length ? <RateChart bars={bars} format={rateNumber} caption={`${t('UAH rate', 'Курс UAH')} · NBU ${rates?.date}`}/>
            : <p className={ui.notice} role="status">{t('Loading rates…', 'Завантажуємо курси…')}</p>}
      </div>
      <div className={styles.quote}>
        <p className={styles.rate}>{base && counter && pairRate ? `1 ${base.currency} = ${rateNumber(pairRate)} ${counter.currency}` : '—'}</p>
        <dl className={styles.terms}>
          <dt>{t('Limits', 'Ліміти')}<SoonBadge/></dt><dd>—</dd>
          <dt>{t('Commission', 'Комісія')}</dt><dd>{quote ? m.format(quote.fee, quote.sourceCurrency) : '—'}</dd>
        </dl>
        {quote && expired && <span className={styles.expired} role="status">{t('This quote has expired. Review the exchange again.', 'Розрахунок застарів. Розрахуй обмін ще раз.')}</span>}
        {quote && !expired
          ? <button type="button" className={`${ui.buttonPrimary} ${styles.action}`} disabled={m.disabled} onClick={() => void confirm()}>{t('Confirm exchange', 'Підтвердити обмін')} · {secondsLeft} {t('s', 'с')}</button>
          : <button type="button" className={`${ui.buttonPrimary} ${styles.action}`} disabled={m.disabled || !destination || !amount} onClick={() => void review()}>{t('Review exchange', 'Розрахувати обмін')}</button>}
      </div>
    </section>
  </WorkspaceLayout>
}
