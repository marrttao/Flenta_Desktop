import { Link } from 'react-router-dom'
import type { Account, DashboardModel } from '../model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { Dialog, Feedback, Icon } from './DashboardLayout'
import styles from './Dashboard.module.css'

export function CardsPanel({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const account = m.activeAccount
  const card = m.activeCard
  function dismiss() { if (m.busy) return; m.setAction(null) }

  return <>
    <section className={styles.cardSection} aria-label={t('Current account', 'Поточний рахунок')}>
      <div className={styles.bankCard}>
        <div className={styles.cardTop}><span>Flenta</span><span className={styles.cardBadge}>{card?.status === 'Blocked' ? t('Blocked', 'Заблокована') : card?.status === 'Closed' ? t('Closed', 'Закрита') : account?.currency || 'UAH'}</span></div>
        <div className={styles.balance}>{m.user && m.loaded && account ? m.format(account.balance, account.currency) : '—'}</div>
        <div className={styles.cardNumber}>{card?.maskedNumber || (account ? t('Your account is ready', 'Рахунок готовий до роботи') : t('Your everyday starts here', 'Тут починається твій день'))}</div>
        <div className={styles.cardBottom}><span>{card ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}` : 'FLENTA'}</span>
          <Link to="/cards">{t('Other cards', 'Інші картки')}<Icon name="card"/></Link></div>
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

  </>
}
