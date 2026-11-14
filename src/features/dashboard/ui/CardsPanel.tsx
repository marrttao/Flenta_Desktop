import { useEffect, useState } from 'react'
import type { Account, Card, DashboardModel } from '../model/useDashboard'
import { parseAmount, bankingError } from '../../banking/utils/banking.js'
import { Dialog, Feedback, Icon } from './DashboardLayout'
import styles from './Dashboard.module.css'

interface CardSecrets { number: string; cvv: string; expiryMonth: number; expiryYear: number }

export function CardsPanel({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const account = m.activeAccount
  const card = m.activeCard
  const [detail, setDetail] = useState<Card | null>(null)
  const [secrets, setSecrets] = useState<CardSecrets | null>(null)
  const [secretError, setSecretError] = useState('')
  const [revealing, setRevealing] = useState(false)
  const [closeCard, setCloseCard] = useState<Card | null>(null)
  useEffect(() => {
    if (!secrets) return
    const timeout = window.setTimeout(() => { setSecrets(null); setDetail(null) }, 60_000)
    return () => window.clearTimeout(timeout)
  }, [secrets])
  function dismiss() { if (m.busy || revealing) return; setDetail(null); setSecrets(null); setCloseCard(null); m.setAction(null) }

  return <>
    <section className={styles.cardSection} aria-label={t('Current account', 'Поточний рахунок')}>
      <div className={styles.bankCard}>
        <div className={styles.cardTop}><span>Flenta</span><span className={styles.cardBadge}>{card?.status === 'Blocked' ? t('Blocked', 'Заблокована') : card?.status === 'Closed' ? t('Closed', 'Закрита') : account?.currency || 'UAH'}</span></div>
        <div className={styles.balance}>{m.user && m.loaded && account ? m.format(account.balance, account.currency) : '—'}</div>
        <div className={styles.cardNumber}>{card?.maskedNumber || (account ? t('Your account is ready', 'Рахунок готовий до роботи') : t('Your everyday starts here', 'Тут починається твій день'))}</div>
        <div className={styles.cardBottom}><span>{card ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}` : 'FLENTA'}</span>
          <button type="button" onClick={() => m.setAction('cards')}>{t('Other cards', 'Інші картки')}<Icon name="card"/></button></div>
      </div>
      <div className={styles.accountStrip}>
        <label className={styles.srOnly} htmlFor="dashboard-active-account">{t('Current account', 'Поточний рахунок')}</label>
        <select id="dashboard-active-account" value={account?.id || ''} disabled={m.disabled || !m.accounts.length} onChange={e => m.selectAccount(e.target.value)}>
          {!m.accounts.length && <option value="">{t('No accounts yet', 'Рахунків поки немає')}</option>}
          {m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)} · {m.format(a.balance, a.currency)}</option>)}
        </select>
        <button className={styles.textButton} type="button" disabled={m.disabled} onClick={() => m.setAction('accounts')}><Icon name="plus"/>{t('Account', 'Рахунок')}</button>
      </div>
    </section>

    {m.action === 'accounts' && <Dialog title={t('Your accounts', 'Твої рахунки')} onClose={dismiss}>
      <Feedback model={m}/>
      <div className={styles.itemList}>{m.accounts.map(a => <button type="button" key={a.id} className={styles.accountItem} disabled={m.busy} onClick={() => { m.selectAccount(a.id); dismiss() }}>
        <span className={styles.currencyIcon}>{a.currency.slice(0, 1)}</span><span>{a.currency}<small>{a.iban}</small></span><strong>{m.format(a.balance, a.currency)}</strong>
      </button>)}</div>
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        if (await m.run(async () => { const a = await m.finance.openAccount(m.request, String(data.get('currency'))) as Account; m.selectAccount(a.id); return a }, t('Account opened.', 'Рахунок відкрито.'))) m.setAction(null)
      }}><fieldset disabled={m.disabled}><label>{t('New account currency', 'Валюта нового рахунку')}<select name="currency"><option>UAH</option><option>USD</option><option>EUR</option></select></label>
        <button className={styles.primary} type="submit">{t('Open account', 'Відкрити рахунок')}</button></fieldset></form>
    </Dialog>}

    {m.action === 'topup' && <Dialog title={t('Top up your account', 'Поповнити рахунок')} onClose={dismiss}>
      <p className={styles.muted}>{t('Virtual funds for testing Flenta.', 'Віртуальні кошти для тестування Flenta.')}</p><Feedback model={m}/>
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        if (await m.run(() => m.operation(`/api/accounts/${data.get('accountId')}/top-ups`, { amount: parseAmount(data.get('amount')) }), t('Virtual top-up completed.', 'Тестове поповнення виконано.'))) m.setAction(null)
      }}><fieldset disabled={m.disabled || !account}><label>{t('Account', 'Рахунок')}<select name="accountId" defaultValue={account?.id} required>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}</select></label>
        <label>{t('Amount in the selected account currency', 'Сума у валюті обраного рахунку')}<input name="amount" inputMode="decimal" required defaultValue="1000"/></label>
        <button className={styles.primary} type="submit">{m.busy ? t('Processing…', 'Обробка…') : t('Top up', 'Поповнити')}</button></fieldset></form>
      {!account && <button className={styles.secondary} type="button" onClick={() => m.setAction('accounts')}>{t('Open an account first', 'Спочатку відкрий рахунок')}</button>}
    </Dialog>}

    {m.action === 'cards' && <Dialog title={t('Your cards', 'Твої картки')} onClose={dismiss}>
      <Feedback model={m}/>
      <div className={styles.itemList}>{m.cards.map(c => <article key={c.id} className={styles.cardItem}>
        <button type="button" className={styles.cardChoice} disabled={m.disabled} aria-pressed={card?.id === c.id} onClick={() => { m.selectCard(c); dismiss() }}>
          <span className={styles.miniCard}>ϟ</span><span>{c.maskedNumber}<small>{c.status} · {m.accounts.find(a => a.id === c.accountId)?.currency}</small></span><Icon name="arrow"/>
        </button>
        <div className={styles.inlineActions}>
          <button type="button" disabled={m.disabled || c.status !== 'Active'} onClick={() => { setDetail(c); setSecrets(null); setSecretError('') }}>{t('Details', 'Реквізити')}</button>
          <button type="button" disabled={m.disabled || c.status === 'Closed'} onClick={() => void m.run(() => m.bank.changeCard(c.id, c.status === 'Blocked' ? 'unblock' : 'block'), t('Card status updated.', 'Статус картки оновлено.'))}>{c.status === 'Blocked' ? t('Unblock', 'Розблокувати') : t('Block', 'Заблокувати')}</button>
          <button type="button" disabled={m.disabled || c.status === 'Closed'} onClick={() => setCloseCard(c)}>{t('Close card', 'Закрити картку')}</button>
        </div>
      </article>)}</div>
      {!m.cards.length && <p className={styles.muted}>{t('Create your first virtual card for an existing account.', 'Створи першу віртуальну картку до свого рахунку.')}</p>}
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        await m.run(async () => { const c = await m.bank.createCard(String(data.get('accountId'))) as Card; m.selectCard(c); return c }, t('Virtual card created.', 'Віртуальну картку створено.'))
      }}><fieldset disabled={m.disabled || !account}><label>{t('Account for the new card', 'Рахунок для нової картки')}<select name="accountId" required defaultValue={account?.id}>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}</select></label>
        <button className={styles.primary} type="submit"><Icon name="plus"/>{t('Create virtual card', 'Створити віртуальну картку')}</button></fieldset></form>
      {!account && <button className={styles.secondary} type="button" onClick={() => m.setAction('accounts')}>{t('Open an account first', 'Спочатку відкрий рахунок')}</button>}
    </Dialog>}

    {detail && m.action === 'cards' && <Dialog title={t('Virtual card details', 'Реквізити тестової картки')} onClose={() => { if (!revealing) { setDetail(null); setSecrets(null) } }}>
      {secretError && <p role="alert" className={styles.error}>{secretError}</p>}
      {secrets ? <><p className={styles.muted}>{t('These details will be hidden in 60 seconds.', 'Реквізити будуть приховані через 60 секунд.')}</p><dl className={styles.requisites}><dt>{t('Card number', 'Номер картки')}</dt><dd>{secrets.number.replace(/(.{4})/g, '$1 ').trim()}</dd><dt>CVV</dt><dd>{secrets.cvv}</dd><dt>{t('Valid through', 'Дійсна до')}</dt><dd>{String(secrets.expiryMonth).padStart(2, '0')}/{String(secrets.expiryYear).slice(-2)}</dd></dl></>
        : <form onSubmit={async e => {
          e.preventDefault(); const data = new FormData(e.currentTarget); e.currentTarget.reset(); setRevealing(true); setSecretError('')
          try { setSecrets(await m.bank.requisites(detail.id, String(data.get('password'))) as CardSecrets) }
          catch (failure) { setSecretError(bankingError(failure)) } finally { setRevealing(false) }
        }}><fieldset disabled={revealing}><p>{t('Confirm your password to reveal details for', 'Підтвердь пароль для перегляду реквізитів картки')} {detail.maskedNumber}.</p><label>{t('Account password', 'Пароль облікового запису')}<input name="password" type="password" autoComplete="current-password" maxLength={128} required autoFocus/></label>
          <button className={styles.primary} type="submit">{revealing ? t('Checking…', 'Перевіряємо…') : t('Reveal details', 'Показати реквізити')}</button></fieldset></form>}
    </Dialog>}
    {closeCard && m.action === 'cards' && <Dialog title={t('Close this card?', 'Закрити цю картку?')} onClose={() => { if (!m.busy) setCloseCard(null) }}>
      <p>{closeCard.maskedNumber}</p><p className={styles.muted}>{t('You cannot reactivate this card. Its account and balance will remain available.', 'Цю картку неможливо активувати повторно. Рахунок і баланс залишаться доступними.')}</p><Feedback model={m}/>
      <div className={styles.inlineActions}><button className={styles.secondary} type="button" disabled={m.busy} onClick={() => setCloseCard(null)}>{t('Cancel', 'Скасувати')}</button><button className={styles.danger} type="button" disabled={m.disabled} onClick={async () => { if (await m.run(() => m.bank.changeCard(closeCard.id, 'close'), t('Card closed.', 'Картку закрито.'))) setCloseCard(null) }}>{t('Close card permanently', 'Закрити картку назавжди')}</button></div>
    </Dialog>}
  </>
}
