import { useResource } from '../../workspace/model/useResource'
import type { IdentityData } from '../../profile/model/identity'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, type Card, type DashboardModel } from '../../dashboard/model/useDashboard'
import { lastDigits, transactionLabel, transactionStatus } from '../../banking/utils/transactionLabel'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { EmptyState, Feedback, ToggleRow } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { AddCardDialog, CardDetailsDialog, CloseCardDialog, TestPurchaseDialog } from './CardDialogs'
import styles from './Cards.module.css'

type CardDialog = 'add' | 'details' | 'close' | 'purchase' | null

function maskedDigits(card: Card | undefined) {
  return `••••  ••••  ••••  ${card ? lastDigits(card.maskedNumber) : '••••'}`
}

function expiry(card: Card, long = false) {
  const month = String(card.expiryMonth).padStart(2, '0')
  return long ? `${month} / ${card.expiryYear}` : `${month}/${String(card.expiryYear).slice(-2)}`
}

function CardStatus({ card, model: m }: { card: Card; model: DashboardModel }) {
  const t = m.text
  if (card.adminFrozen) return <span className={styles.chip}>{t('Restricted by administrator', 'Обмежено адміністратором')}</span>
  if (card.status === 'Active') return <span className={`${styles.chip} ${styles.chipActive}`}>{t('Active', 'Активна')}</span>
  if (card.status === 'Blocked') return <span className={`${styles.chip} ${styles.chipFrozen}`}>{t('Frozen', 'Заморожена')}</span>
  return <span className={`${styles.chip} ${styles.chipClosed}`}>{t('Closed', 'Закрита')}</span>
}

function CardActivity({ model: m, card }: { model: DashboardModel; card: Card }) {
  const t = m.text
  const rows = m.transactions.filter(row => row.sourceAccountId === card.accountId || row.destinationAccountId === card.accountId).slice(0, 4)
  return <section className={styles.activity}>
    <div className={styles.activityHead}><h2 className={styles.panelTitle}>{t('Recent card activity', 'Остання активність')}</h2><Link className={styles.viewAll} to="/#recent-transactions">{t('View all', 'Усі операції')}</Link></div>
    {rows.length ? <div role="table" aria-label={t('Recent card activity', 'Остання активність')}>
      <div role="row" className={`${styles.activityGrid} ${styles.activityHeader}`}><span role="columnheader">{t('Operation', 'Операція')}</span><span role="columnheader">{t('Date', 'Дата')}</span><span role="columnheader">{t('Amount', 'Сума')}</span></div>
      {rows.map(row => {
        const outgoing = row.sourceAccountId === card.accountId
        const incomingExchange=!outgoing && row.destinationCurrency && row.receivedAmount!=null
        const amount=incomingExchange?row.receivedAmount!:row.amount
        const currency=incomingExchange?row.destinationCurrency!:row.currency
        return <div role="row" key={row.id} className={`${styles.activityGrid} ${styles.activityRow}`}>
          <span role="cell" className={styles.merchant}><Icon name={row.kind === 'Purchase' ? 'card' : row.kind === 'Exchange' ? 'exchange' : 'transfer'}/>
            <span><strong>{transactionLabel(row.kind, t)}</strong><small>{row.destinationIban ? `IBAN ···· ${row.destinationIban.slice(-4)}` : row.status === 'Completed' ? 'Flenta' : transactionStatus(row.status, t)}</small></span></span>
          <span role="cell" className={styles.activityDate}>{new Date(row.createdAt).toLocaleDateString(m.locale, { month: 'short', day: '2-digit', year: 'numeric' })}</span>
          <span role="cell" className={styles.activityAmount}>{outgoing ? '−' : '+'}{m.format(amount, currency)}</span>
        </div>
      })}
    </div> : <EmptyState icon={<Icon name="statement"/>} title={t('No activity yet', 'Операцій поки немає')}>{t('Payments and transfers from this card’s account will appear here.', 'Тут з’являться оплати й перекази з рахунку цієї картки.')}</EmptyState>}
  </section>
}

function CardControls({ model: m, card, onClose, onPurchase }: { model: DashboardModel; card: Card; onClose: () => void; onPurchase: () => void }) {
  const t = m.text
  const settings = { onlinePayments: card.onlinePayments, contactlessPayments: card.contactlessPayments, cashWithdrawals: card.cashWithdrawals, monthlyLimit: card.monthlyLimit }
  const save = (patch: Partial<typeof settings>) => void m.run(() => m.request('/api/cards/' + card.id + '/settings', { method: 'PUT', body: { ...settings, ...patch } }), t('Card settings saved.', 'Налаштування картки збережено.'))
  return <section className={styles.controls}>
    <h2 className={styles.panelTitle}>{t('Card controls', 'Керування карткою')}</h2>
    <ToggleRow label={t('Online payments', 'Онлайн-платежі')} description={t('Pay securely on the web', 'Безпечна оплата в інтернеті')} checked={card.onlinePayments} disabled={m.disabled || card.status === 'Closed'} onChange={onlinePayments => save({ onlinePayments })}/>
    <ToggleRow label={t('Contactless payments', 'Безконтактна оплата')} description={t('Tap to pay in stores', 'Оплата дотиком у магазинах')} checked={card.contactlessPayments} disabled={m.disabled || card.status === 'Closed'} onChange={contactlessPayments => save({ contactlessPayments })}/>
    <ToggleRow label={t('Cash withdrawals', 'Зняття готівки')} description={t('Card withdrawal preference. Virtual cards are sandbox only.', 'Налаштування зняття. Віртуальні картки працюють у sandbox.')} checked={card.cashWithdrawals} disabled={m.disabled || card.status === 'Closed'} onChange={cashWithdrawals => save({ cashWithdrawals })}/>
    <form key={card.id + ':' + card.monthlyLimit} onSubmit={e => { e.preventDefault(); save({ monthlyLimit: Number(new FormData(e.currentTarget).get('limit')) }) }}>
      <fieldset disabled={m.disabled || card.status === 'Closed'}><label className={ui.field}>{t('Monthly spending limit', 'Місячний ліміт витрат')}<input name="limit" type="number" min="0.01" max="10000000000" step="0.01" required defaultValue={card.monthlyLimit}/></label>
      <button type="submit" className={ui.button}>{t('Save limit', 'Зберегти ліміт')}</button></fieldset>
    </form>
    <div className={styles.controlActions}>
      <button type="button" className={ui.button} disabled={m.disabled || card.status !== 'Active'} onClick={onPurchase}>{t('Test purchase', 'Тестова покупка')}</button>
      <button type="button" className={ui.buttonDanger} disabled={m.disabled || card.status === 'Closed'} onClick={onClose}>{t('Close card', 'Закрити картку')}</button>
    </div>
  </section>
}

export function CardsPage() {
  const m = useDashboard()
  const t = m.text
  const [selectedId, setSelectedId] = useState('')
  const [dialog, setDialog] = useState<CardDialog>(null)
  const card = m.cards.find(c => c.id === selectedId) ?? m.cards.find(c => c.status !== 'Closed') ?? m.cards[0]
  const account = m.accounts.find(a => a.id === card?.accountId)
  const primaryId = m.cards.find(c => c.status !== 'Closed')?.id
  const identity=useResource<IdentityData|null>('/api/profile/identity')
  const legalName=identity.state.status==='ready'?identity.state.data?.fullName:undefined
  const holder = (legalName || '—').toUpperCase()

  function open(next: CardDialog) { m.clearFeedback(); setDialog(next) }

  return <WorkspaceLayout section="cards" title={t('Cards', 'Картки')} subtitle={t('Your everyday spending, in one place.', 'Усі щоденні витрати в одному місці.')}
    actions={<button type="button" className={`${ui.button} ${styles.addButton}`} disabled={m.disabled} onClick={() => open('add')}>{`+  ${t('Add new card', 'Додати картку')}`}</button>}>
    {dialog === null && <Feedback error={m.error} notice={m.notice}/>}
    {m.loading && !m.loaded && <p className={ui.notice} role="status">{t('Loading your cards…', 'Завантажуємо картки…')}</p>}

    {m.cards.length > 1 && <div className={styles.cardPicker} role="group" aria-label={t('Choose a card', 'Обери картку')}>
      {m.cards.map(c => <button key={c.id} type="button" className={ui.segment} aria-pressed={c.id === card?.id} onClick={() => setSelectedId(c.id)}>
        <Icon name="card" size={16}/>•• {lastDigits(c.maskedNumber)} · {m.accounts.find(a => a.id === c.accountId)?.currency}
      </button>)}
    </div>}

    {card ? <>
      <div className={styles.grid}>
        <section className={styles.bankCard} aria-label={t('Selected card', 'Обрана картка')}>
          <div className={styles.bankCardTop}><strong>Flenta</strong><span>{t('Debit', 'Дебетова')}</span></div>
          <div className={styles.label}>{t('Available balance', 'Доступний баланс')}</div>
          <div className={styles.balance}>{account ? m.format(account.balance, account.currency) : '—'}</div>
          <div className={styles.number}>{maskedDigits(card)}</div>
          <div className={styles.bankCardBottom}><span>{holder}</span><span>{expiry(card)}</span></div>
        </section>
        <section className={styles.overview}>
          <div className={styles.overviewHead}>
            <div><h2 className={styles.overviewTitle}>{card.id === primaryId ? t('Primary card', 'Основна картка') : `${t('Card', 'Картка')} •• ${lastDigits(card.maskedNumber)}`}</h2>
              <p>{t('Virtual debit card', 'Віртуальна дебетова картка')} · {account?.currency}</p></div>
            <CardStatus card={card} model={m}/>
          </div>
          <dl className={styles.details}>
            <dt>{t('Card number', 'Номер картки')}</dt><dd>{maskedDigits(card)}</dd>
            <dt>{t('Expiry date', 'Термін дії')}</dt><dd>{expiry(card, true)}</dd>
            <dt>{t('Cardholder', 'Власник')}</dt><dd>{legalName || '—'}</dd>
          </dl>
          <div className={styles.cardActions}>
            <button type="button" className={ui.button} disabled={m.disabled || card.status !== 'Active'} onClick={() => open('details')}>{t('Show card details', 'Показати реквізити')}</button>
            <button type="button" className={ui.button} disabled={m.disabled || card.adminFrozen || card.status === 'Closed'} onClick={() => void m.run(() => m.bank.changeCard(card.id, card.status === 'Blocked' ? 'unblock' : 'block'),
              card.status === 'Blocked' ? t('Card unfrozen.', 'Картку розморожено.') : t('Card frozen.', 'Картку заморожено.'))}>
              {card.status === 'Blocked' ? t('Unfreeze card', 'Розморозити картку') : t('Freeze card', 'Заморозити картку')}
            </button>
          </div>
        </section>
      </div>
      <div className={styles.lower}>
        <CardActivity model={m} card={card}/>
        <CardControls model={m} card={card} onClose={() => open('close')} onPurchase={() => open('purchase')}/>
      </div>
    </> : m.loaded && <section className={ui.panel}>
      <EmptyState icon={<Icon name="card"/>} title={t('No cards yet', 'Карток поки немає')}>{t('Create a free virtual debit card to start paying.', 'Створи безкоштовну віртуальну дебетову картку, щоб почати платити.')}</EmptyState>
    </section>}

    {dialog === 'add' && <AddCardDialog model={m} onClose={() => setDialog(null)} onCreated={created => { setSelectedId(created.id); setDialog(null) }}/>}
    {dialog === 'details' && card && <CardDetailsDialog model={m} card={card} onClose={() => setDialog(null)}/>}
    {dialog === 'close' && card && <CloseCardDialog model={m} card={card} onClose={() => setDialog(null)}/>}
    {dialog === 'purchase' && card && <TestPurchaseDialog model={m} card={card} onClose={() => setDialog(null)}/>}
  </WorkspaceLayout>
}
