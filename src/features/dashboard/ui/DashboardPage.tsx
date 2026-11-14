import { useState } from 'react'
import { useDashboard, type DashboardModel, type Transaction } from '../model/useDashboard'
import { bankingError, parseAmount } from '../../banking/utils/banking.js'
import { DashboardLayout, Dialog, Feedback, Icon } from './DashboardLayout'
import { CardsPanel } from './CardsPanel'
import { TransfersPanel } from './TransfersPanel'
import { SavingsPanel } from './SavingsPanel'
import styles from './Dashboard.module.css'

function transactionLabel(transaction: Transaction, m: DashboardModel) {
  const labels: Record<string, string> = {
    TopUp: m.text('Top up', 'Поповнення'), InternalTransfer: m.text('Internal transfer', 'Між рахунками'),
    IbanTransfer: m.text('IBAN transfer', 'Переказ за IBAN'), Purchase: m.text('Card payment', 'Оплата карткою'),
    SavingsDeposit: m.text('Savings deposit', 'Поповнення цілі'), SavingsWithdrawal: m.text('Savings withdrawal', 'Повернення з цілі'),
    Exchange: m.text('Currency exchange', 'Обмін валют'),
  }
  return labels[transaction.kind] || transaction.kind
}

function exportPage(m: DashboardModel) {
  const cell = (value: string | number) => {
    const safe = typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? `'${value}` : String(value)
    return `"${safe.replace(/"/g, '""')}"`
  }
  const rows = [['Date', 'Operation', 'Amount', 'Currency', 'Fee', 'Status'], ...m.transactions.map(t => [t.createdAt, t.kind, t.amount, t.currency, t.fee, t.status])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = `flenta-transactions-page-${m.offset / 20 + 1}.csv`; link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function History({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const [search, setSearch] = useState('')
  const transactions = m.transactions.filter(row => `${row.kind} ${transactionLabel(row, m)} ${row.status} ${row.currency} ${row.destinationIban || ''} ${row.destinationAccountId || ''}`.toLowerCase().includes(search.toLowerCase().trim()))
  const status = (value: string) => ({ Completed: t('Completed', 'Виконано'), Rejected: t('Declined', 'Відхилено'), Pending: t('Pending', 'В обробці') }[value] || value)
  return <section id="dashboard-history" className={styles.history}>
    <div className={styles.sectionHeading}><h2>{t('Recent transactions', 'Останні операції')}</h2><button className={styles.textButton} type="button" disabled={!m.transactions.length} onClick={() => exportPage(m)}><Icon name="statement"/><span>CSV</span></button></div>
    <label className={styles.historySearch}><Icon name="search"/><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Filter this page', 'Пошук на цій сторінці')} aria-label={t('Filter transactions on this page', 'Пошук операцій на цій сторінці')}/></label>
    {transactions.length ? <div className={styles.tableScroll}><table><thead><tr><th>{t('Date', 'Дата')}</th><th>{t('Operation', 'Операція')}</th><th>{t('Amount / fee', 'Сума / комісія')}</th><th>{t('Status', 'Статус')}</th></tr></thead><tbody>{transactions.map(row => <tr key={row.id}>
      <td>{new Date(row.createdAt).toLocaleDateString(m.locale, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td><strong>{transactionLabel(row, m)}</strong><small>{row.destinationIban || (row.destinationAccountId ? `…${row.destinationAccountId.slice(-6)}` : 'Flenta')}{row.failureCode && ` · ${bankingError({ code: row.failureCode, message: t('Operation declined', 'Операцію відхилено') })}`}</small></td>
      <td className={styles.amount}>{m.format(row.amount, row.currency)}<small>{t('Fee', 'Комісія')}: {m.format(row.fee, row.currency)}</small></td>
      <td><span className={`${styles.chip} ${row.status === 'Completed' ? styles.completed : row.status === 'Rejected' ? styles.rejected : styles.pending}`}>{status(row.status)}</span></td>
    </tr>)}</tbody></table></div> : <div className={styles.empty}><span className={styles.emptyIcon}><Icon name="statement"/></span><h3>{search ? t('No matching transactions', 'Операцій не знайдено') : t('A fresh start', 'Новий початок')}</h3><p>{search ? t('Try a different search on this page.', 'Спробуй інший пошук на цій сторінці.') : t('Your top-ups, transfers and purchases will appear here.', 'Тут з’являться твої поповнення, перекази та покупки.')}</p></div>}
    <div className={styles.pagination}><button type="button" className={styles.textButton} disabled={m.disabled || m.offset === 0} onClick={() => { setSearch(''); m.setOffset(Math.max(0, m.offset - 20)) }}>← {t('Newer', 'Новіші')}</button><span>{t('Page', 'Сторінка')} {m.offset / 20 + 1}</span><button type="button" className={styles.textButton} disabled={m.disabled || m.transactions.length < 20 || m.offset >= 10000} onClick={() => { setSearch(''); m.setOffset(m.offset + 20) }}>{t('Older', 'Старіші')} →</button></div>
  </section>
}

function Spending({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const spending = m.analytics?.currencies.find(c => c.currency === m.activeAccount?.currency)
  return <section className={styles.spending}>
    <header><span className={styles.goalIcon}><Icon name="wallet"/></span><div><h2>{t('Monthly spending', 'Витрати за місяць')}</h2><small>{new Date().toLocaleDateString(m.locale, { month: 'long', year: 'numeric' })}</small></div><span className={styles.chip}>{m.activeAccount?.currency || 'UAH'}</span></header>
    {m.analyticsError ? <p className={styles.error} role="alert">{m.analyticsError}</p> : spending && spending.purchases > 0 ? <div className={styles.spendingValue}><strong>{m.format(spending.expenses, spending.currency)}</strong><span>{spending.purchases} {t('purchases this month', 'покупок цього місяця')}</span></div> : <div className={styles.spendingEmpty}><span className={styles.emptyIcon}><Icon name="card"/></span><strong>{t('No spending data available', 'Даних про витрати поки немає')}</strong><small>{t('Your monthly spending summary will appear once transactions are processed.', 'Огляд витрат з’явиться після обробки операцій.')}</small></div>}
    <footer><small>{t('A little clarity for your money.', 'Більше ясності у твоїх фінансах.')}</small><a href="#dashboard-history">{t('View transactions', 'До операцій')} <Icon name="arrow"/></a></footer>
  </section>
}

export function DashboardPage() {
  const m = useDashboard()
  const t = m.text
  const quickActions = [
    { icon: 'wallet' as const, title: t('Top up', 'Поповнення'), description: t('Add virtual funds to your account', 'Додай віртуальні кошти на рахунок'), action: () => m.setAction('topup'), disabled: m.disabled },
    { icon: 'transfer' as const, title: t('Transfer', 'Переказ'), description: t('Send money between accounts', 'Переказуй між рахунками'), action: () => m.setAction('transfer'), disabled: m.disabled },
    { icon: 'statement' as const, title: t('Statement', 'Виписка'), description: t('Export this transaction page as CSV', 'Експортуй цю сторінку операцій у CSV'), action: () => exportPage(m), disabled: !m.transactions.length },
    { icon: 'purchase' as const, title: t('Card payment', 'Оплата карткою'), description: t('Try a virtual purchase and round-ups', 'Спробуй тестову покупку та округлення'), action: () => m.setAction('purchase'), disabled: m.disabled || !m.cards.some(c => c.status === 'Active') },
    { icon: 'plus' as const, title: t('New account', 'Новий рахунок'), description: t('Keep UAH, USD and EUR separately', 'Тримай UAH, USD та EUR окремо'), action: () => m.setAction('accounts'), disabled: m.disabled },
  ]
  return <DashboardLayout model={m}>
    <div className={styles.overview}><CardsPanel model={m}/><Spending model={m}/></div>
    <div className={styles.detailsGrid}><History model={m}/><section className={styles.quickActions}><h2>{t('Quick actions', 'Швидкі дії')}</h2><div className={styles.actionList}>
      {quickActions.map(action => <button key={action.icon} type="button" disabled={action.disabled} onClick={action.action}><span className={styles.actionIcon}><Icon name={action.icon}/></span><span><strong>{action.title}</strong><small>{action.description}</small></span><Icon name="arrow"/></button>)}
      <a href="#dashboard-savings"><span className={styles.actionIcon}><Icon name="savings"/></span><span><strong>{t('Piggy bank', 'Накопичення')}</strong><small>{t('Save for your goals', 'Відкладай на свої цілі')}</small></span><Icon name="arrow"/></a>
    </div></section></div>
    <SavingsPanel model={m}/><TransfersPanel model={m}/>
    {m.action === 'purchase' && <Dialog title={t('Try a virtual purchase', 'Спробувати тестову покупку')} onClose={() => { if (!m.busy) m.setAction(null) }}>
      <p className={styles.muted}>{t('This sandbox payment can trigger cashback and the savings rules you configured. Savings contributions are charged in addition to the purchase.', 'Ця тестова покупка може нарахувати кешбек і застосувати твої правила накопичення. Відрахування списується додатково до покупки.')}</p><Feedback model={m}/>
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        if (await m.run(() => m.operation('/api/finance/purchases', { cardId: data.get('cardId'), amount: parseAmount(data.get('amount')) }), t('Virtual purchase completed.', 'Тестову покупку оплачено.'))) m.setAction(null)
      }}><fieldset disabled={m.disabled}><label>{t('Card', 'Картка')}<select name="cardId" defaultValue={m.activeCard?.status === 'Active' ? m.activeCard.id : undefined} required>{m.cards.filter(c => c.status === 'Active').map(c => <option key={c.id} value={c.id}>{c.maskedNumber} · {m.accounts.find(a => a.id === c.accountId)?.currency}</option>)}</select></label>
        <label>{t('Amount in the card account currency', 'Сума у валюті рахунку картки')}<input name="amount" inputMode="decimal" required/></label><button className={styles.primary} type="submit">{t('Pay with virtual funds', 'Оплатити віртуальними коштами')}</button></fieldset></form>
    </Dialog>}
    {m.action === 'help' && <Dialog title={t('A little help with Flenta', 'Допомога з Flenta')} onClose={() => m.setAction(null)}>
      <p>{t('Open an account, add virtual funds and create a card. Review transfer fees before confirming. To save automatically, create a savings goal and choose Round-ups or Percentage in its settings.', 'Відкрий рахунок, додай віртуальні кошти та створи картку. Перевір комісію перед підтвердженням переказу. Для автоматичного накопичення створи ціль та обери округлення або відсоток у її налаштуваннях.')}</p><p className={styles.muted}>{t('All operations in this banking sandbox are virtual. KYC is still required for account access.', 'Усі операції в цій банківській пісочниці віртуальні. Для доступу до облікового запису потрібна перевірка KYC.')}</p>
    </Dialog>}
  </DashboardLayout>
}
