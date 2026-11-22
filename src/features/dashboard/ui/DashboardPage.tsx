import { Link, useNavigate } from 'react-router-dom'
import { useDashboard, type DashboardModel, type Transaction } from '../model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { transactionLabel, transactionStatus } from '../../banking/utils/transactionLabel'
import type { IconName } from '../../workspace/ui/Icon'
import { DashboardLayout, Dialog, Feedback, Icon } from './DashboardLayout'
import styles from './Dashboard.module.css'
import { StatementDialog } from './StatementDialog'

function BalanceCard({ model: m }: { model: DashboardModel }) {
  const account = m.activeAccount
  const card = m.activeCard
  return <section className={styles.card} aria-label={m.text('Current account', 'Поточний рахунок')}>
    <span className={styles.cardBrand}>Flenta</span>
    <span className={styles.cardBalance}>{m.user && m.loaded && account ? m.format(account.balance, account.currency) : '—'}</span>
    {card && <span className={styles.cardExpiry}>{String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}</span>}
    <Link to="/cards" className={styles.otherCards}>{m.text('Other cards', 'Інші картки')}<Icon name="grid" size={26}/></Link>
  </section>
}

function SpendingWidget({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const spending = m.analytics?.currencies.find(c => c.currency === m.activeAccount?.currency)
  const hasData = Boolean(spending && spending.purchases > 0)
  return <section className={styles.spending}>
    <header className={styles.widgetHeader}>
      <div className={styles.widgetTitle}><span className={styles.widgetIcon}><Icon name="coins" size={18}/></span>
        <div><h2>{t('Monthly Spending', 'Витрати за місяць')}</h2><small>{new Date().toLocaleDateString(m.locale, { month: 'long', year: 'numeric' })}</small></div></div>
      <span className={styles.pill}>{hasData && spending ? spending.currency : t('No Data', 'Немає даних')}</span>
    </header>
    <div className={styles.widgetBody}>
      {m.analyticsError ? <p role="alert">{m.analyticsError}</p> : hasData && spending ? <>
        <span className={styles.spendingValue}>{m.format(spending.expenses, spending.currency)}</span>
        <p>{spending.purchases} {t('purchases this month', 'покупок цього місяця')}</p>
      </> : <>
        <span className={styles.illustration}><Icon name="card" size={18}/></span>
        <div><strong>{t('No spending data available', 'Даних про витрати поки немає')}</strong>
          <p>{t('Your monthly spending summary will appear here once transactions are processed.', 'Огляд витрат за місяць з’явиться тут після обробки операцій.')}</p></div>
      </>}
    </div>
    <footer className={styles.widgetFooter}>
      <span>{t('Check back later for your summary.', 'Зазирни пізніше, щоб побачити підсумок.')}</span>
      <a className={styles.widgetLink} href="#recent-transactions">{t('View Transactions', 'До операцій')}<Icon name="arrow" size={18}/></a>
    </footer>
  </section>
}

function counterparty(row: Transaction, m: DashboardModel) {
  if (row.destinationIban) return `IBAN ···· ${row.destinationIban.slice(-4)}`
  if (row.destinationAccountId && m.accounts.some(a => a.id === row.destinationAccountId) && row.kind !== 'TopUp') return m.text('My account', 'Мій рахунок')
  return 'Flenta'
}

const tableAmount = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 })

const statusClass: Record<string, string> = { Completed: styles.statusCompleted, Pending: styles.statusPending, Rejected: styles.statusRejected }

function RecentTransactions({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const locale = m.locale
  const rows = m.transactions.slice(0, 10)
  const currency = m.activeAccount?.currency || rows[0]?.currency || 'UAH'
  return <section id="recent-transactions">
    <h2 className={styles.sectionTitle}>{t('Recent transactions:', 'Останні операції:')}</h2>
    <table className={styles.table}>
      <colgroup><col style={{ width: '20.9%' }}/><col style={{ width: '21.5%' }}/><col style={{ width: '21.5%' }}/><col style={{ width: '17.2%' }}/><col style={{ width: '18.9%' }}/></colgroup>
      <thead><tr><th>{t('Date', 'Дата')}</th><th>{t('Recipient', 'Одержувач')}</th><th>{t('Category', 'Категорія')}</th><th>{t('Amount', 'Сума')} ({currency})</th><th>{t('Status', 'Статус')}</th></tr></thead>
      <tbody>{rows.length ? rows.map(row => <tr key={row.id}>
        <td className={styles.date}>{new Date(row.createdAt).toLocaleDateString(locale, { month: 'short', day: '2-digit', year: 'numeric' })}</td>
        <td>{counterparty(row, m)}</td>
        <td>{transactionLabel(row.kind, t)}</td>
        <td>{tableAmount.format(row.amount)}{row.currency !== currency && ` ${row.currency}`}</td>
        <td><span className={`${styles.status} ${statusClass[row.status] || styles.statusOther}`}>{transactionStatus(row.status, t)}</span></td>
      </tr>) : <tr className={styles.emptyRow}><td colSpan={5}>{m.loading ? t('Loading transactions…', 'Завантажуємо операції…') : t('Your top-ups, transfers and purchases will appear here.', 'Тут з’являться твої поповнення, перекази та покупки.')}</td></tr>}</tbody>
    </table>
  </section>
}

interface QuickAction { icon: IconName; title: string; description: string; onClick?: () => void; disabled?: boolean; soon?: boolean }

function QuickActions({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const navigate = useNavigate()
  const actions: QuickAction[] = [
    { icon: 'coins', title: t('Top up', 'Поповнення'), description: t('Add funds to your account', 'Додай кошти на рахунок'), onClick: () => m.setAction('topup'), disabled: m.disabled },
    { icon: 'transfer', title: t('Transfer', 'Переказ'), description: t('Send money to contacts', 'Надсилай кошти іншим'), onClick: () => navigate('/transfers') },
    { icon: 'help', title: t('Statement', 'Виписка'), description: t('Download your transactions as CSV', 'Завантаж операції у CSV'), onClick: () => m.setAction('statement'), disabled: !m.user },
    { icon: 'phonePlus', title: t('Mobile top-up', 'Поповнення мобільного'), description: t('Recharge your phone plan', 'Поповни рахунок телефону'), onClick: () => navigate('/payments?kind=mobile') },
    { icon: 'cardRefresh', title: t('Loan repayment', 'Погашення кредиту'), description: t('Manage upcoming payments', 'Керуй майбутніми платежами'), onClick: () => navigate('/payments?kind=loan') },
    { icon: 'savings', title: t('Piggy bank', 'Скарбничка'), description: t('Save for your goals', 'Відкладай на свої цілі'), onClick: () => navigate('/savings') },
  ]
  return <section>
    <h2 className={styles.sectionTitle}>{t('Quick actions', 'Швидкі дії')}</h2>
    <div className={styles.actions}>
      {actions.map(action => <button key={action.icon} type="button" className={styles.action} disabled={action.disabled || action.soon} onClick={action.onClick}>
        <span className={styles.actionIcon}><Icon name={action.icon} size={18}/></span>
        <span className={styles.actionText}><strong>{action.title}{action.soon && <span>{t('Soon', 'Незабаром')}</span>}</strong><small>{action.description}</small></span>
        <Icon name="arrow" size={18}/>
      </button>)}
    </div>
  </section>
}

function TopUpDialog({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const account = m.activeAccount
  return <Dialog title={t('Top up your account', 'Поповнити рахунок')} onClose={() => { if (!m.busy) m.setAction(null) }}>
    <p className={styles.muted}>{t('Virtual funds for testing Flenta.', 'Віртуальні кошти для тестування Flenta.')}</p><Feedback model={m}/>
    {account ? <form onSubmit={async e => {
      e.preventDefault(); const data = new FormData(e.currentTarget)
      if (await m.run(() => m.operation(`/api/accounts/${data.get('accountId')}/top-ups`, { amount: parseAmount(data.get('amount')) }), t('Virtual top-up completed.', 'Тестове поповнення виконано.'))) m.setAction(null)
    }}><fieldset disabled={m.disabled}>
      <label>{t('Account', 'Рахунок')}<select name="accountId" defaultValue={account.id} required>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}</select></label>
      <label>{t('Amount in the selected account currency', 'Сума у валюті обраного рахунку')}<input name="amount" inputMode="decimal" required defaultValue="1000"/></label>
      <button className={styles.primary} type="submit">{m.busy ? t('Processing…', 'Обробка…') : t('Top up', 'Поповнити')}</button>
    </fieldset></form> : <p>{t('You do not have an account yet.', 'У тебе ще немає рахунку.')} <Link to="/cards">{t('Open one on the Cards page.', 'Відкрий його на сторінці «Картки».')}</Link></p>}
  </Dialog>
}

export function DashboardPage() {
  const m = useDashboard()
  return <DashboardLayout model={m}>
    <div className={styles.row}><BalanceCard model={m}/><SpendingWidget model={m}/></div>
    <div className={`${styles.row} ${styles.lower}`}><RecentTransactions model={m}/><QuickActions model={m}/></div>
    {m.action === 'statement' && <StatementDialog model={m}/>}
    {m.action === 'topup' && <TopUpDialog model={m}/>}
  </DashboardLayout>
}
