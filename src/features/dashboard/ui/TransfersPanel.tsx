import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardModel, TransferQuote } from '../model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { Dialog, Feedback } from './DashboardLayout'
import styles from './Dashboard.module.css'

interface Draft { sourceAccountId: string; amount: number; destinationAccountId?: string; iban?: string }

function TransferForm({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const [source, setSource] = useState(m.activeAccount?.id || '')
  const [mode, setMode] = useState('own')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<(TransferQuote & { draft: Draft; byIban: boolean }) | null>(null)
  const account = m.accounts.find(a => a.id === source)
  const destinations = m.accounts.filter(a => a.id !== source && a.currency === account?.currency)
  return <>
    <p className={styles.muted}>{t('Review the amount and fee before confirming your virtual transfer.', 'Перевір суму та комісію перед підтвердженням тестового переказу.')}</p>
    <Feedback model={m}/>
    <form onSubmit={async e => {
      e.preventDefault(); setQuote(null)
      await m.run(async () => {
        const parsed = parseAmount(amount)
        const target = destination.trim()
        const byIban = mode === 'iban'
        if (!account) throw new Error(t('Select a source account.', 'Обери рахунок списання.'))
        if (byIban && !/^UA\d{27}$/.test(target.replace(/\s/g, '').toUpperCase())) throw new Error(t('Enter a Ukrainian IBAN: UA followed by 27 digits.', 'Введи український IBAN: UA та 27 цифр.'))
        if (!byIban && !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(target)) throw new Error(t('Enter a valid recipient account ID.', 'Введи коректний ID рахунку одержувача.'))
        if (!byIban && target.toLowerCase() === source.toLowerCase()) throw new Error(t('Choose a different recipient account.', 'Обери інший рахунок одержувача.'))
        const draft: Draft = { sourceAccountId: source, amount: parsed, ...(byIban ? { iban: target.replace(/\s/g, '').toUpperCase() } : { destinationAccountId: target }) }
        const preview = await m.bank.quote({ sourceAccountId: source, amount: parsed, byIban }) as TransferQuote
        setQuote({ ...preview, draft, byIban })
      }, '')
    }}><fieldset disabled={m.disabled || !m.accounts.length}>
      <label>{t('From account', 'З рахунку')}<select value={source} required onChange={e => { setSource(e.target.value); setDestination(''); setQuote(null) }}>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)} · {m.format(a.balance, a.currency)}</option>)}</select></label>
      <label>{t('Transfer method', 'Спосіб переказу')}<select value={mode} onChange={e => { setMode(e.target.value); setDestination(''); setQuote(null) }}><option value="own">{t('Between my accounts', 'Між моїми рахунками')}</option><option value="account">{t('To account ID', 'За ID рахунку')}</option><option value="iban">{t('To Ukrainian IBAN', 'За українським IBAN')}</option></select></label>
      <label>{mode === 'iban' ? t('Recipient IBAN', 'IBAN одержувача') : t('Recipient account', 'Рахунок одержувача')}
        {mode === 'own' ? <select value={destination} required onChange={e => { setDestination(e.target.value); setQuote(null) }}><option value="">{t('Choose an account', 'Обери рахунок')}</option>{destinations.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}</select>
          : <input required value={destination} maxLength={mode === 'iban' ? 64 : 36} placeholder={mode === 'iban' ? 'UA…' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'} onChange={e => { setDestination(e.target.value); setQuote(null) }}/>}
      </label>
      <label>{t('Amount', 'Сума')} · {account?.currency || 'UAH'}<input value={amount} inputMode="decimal" required placeholder="0.00" onChange={e => { setAmount(e.target.value); setQuote(null) }}/></label>
      {mode === 'own' && !destinations.length && <p className={styles.muted}>{t('Open another account in the same currency, or use currency exchange.', 'Відкрий інший рахунок у цій валюті або скористайся обміном валют.')} <Link to="/finance">{t('Currency exchange', 'Обмін валют')}</Link></p>}
      {mode === 'iban' && <p className={styles.muted}>{t('The recipient must have an account in this sandbox.', 'Одержувач має мати рахунок у цій пісочниці.')}</p>}
      <button className={styles.primary} type="submit">{t('Review transfer', 'Перевірити переказ')}</button>
    </fieldset></form>
    {quote && <div className={styles.quote} aria-live="polite"><h3>{t('Review your transfer', 'Перевір переказ')}</h3><dl><dt>{t('Amount', 'Сума')}</dt><dd>{m.format(quote.amount, quote.currency)}</dd><dt>{t('Fee', 'Комісія')}</dt><dd>{m.format(quote.fee, quote.currency)}</dd><dt>{t('Total debit', 'До списання')}</dt><dd><strong>{m.format(quote.total, quote.currency)}</strong></dd></dl>
      {!quote.sufficientFunds && <p className={styles.error} role="alert">{t('Insufficient funds including the fee.', 'Недостатньо коштів з урахуванням комісії.')}</p>}
      <button className={styles.primary} type="button" disabled={m.disabled || !quote.sufficientFunds} onClick={async () => {
        if (await m.run(() => m.bank.transfer(quote.byIban, quote.draft), t('Transfer completed.', 'Переказ виконано.'))) { setQuote(null); m.setAction(null) }
      }}>{t('Confirm transfer', 'Підтвердити переказ')} · {m.format(quote.total, quote.currency)}</button>
    </div>}
    {!m.accounts.length && <button className={styles.secondary} type="button" onClick={() => m.setAction('accounts')}>{t('Open an account first', 'Спочатку відкрий рахунок')}</button>}
  </>
}

export function TransfersPanel({ model: m }: { model: DashboardModel }) {
  if (m.action !== 'transfer') return null
  return <Dialog title={m.text('Send money', 'Переказати кошти')} onClose={() => { if (!m.busy) m.setAction(null) }}><TransferForm model={m}/></Dialog>
}
