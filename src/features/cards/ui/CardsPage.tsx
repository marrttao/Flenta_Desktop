import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, type Card, type DashboardModel } from '../../dashboard/model/useDashboard'
import { lastDigits, transactionLabel } from '../../banking/utils/transactionLabel'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { EmptyState, Feedback, SoonBadge, StatusChip, ToggleRow } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { AddCardDialog, CardDetailsDialog, CloseCardDialog } from './CardDialogs'
import styles from './Cards.module.css'

type CardDialog = 'add' | 'details' | 'close' | null

function maskedDigits(card: Card | undefined) {
  return `••••  ••••  ••••  ${card ? lastDigits(card.maskedNumber) : '••••'}`
}

function expiry(card: Card, long = false) {
  const month = String(card.expiryMonth).padStart(2, '0')
  return long ? `${month} / ${card.expiryYear}` : `${month}/${String(card.expiryYear).slice(-2)}`
}

function CardStatus({ card, model: m }: { card: Card; model: DashboardModel }) {
  const t = m.text
  if (card.status === 'Active') return <StatusChip tone="success">{t('Active', 'Активна')}</StatusChip>
  if (card.status === 'Blocked') return <StatusChip tone="warning">{t('Frozen', 'Заморожена')}</StatusChip>
  return <StatusChip tone="danger">{t('Closed', 'Закрита')}</StatusChip>
}

function CardActivity({ model: m, card }: { model: DashboardModel; card: Card }) {
  const t = m.text
  const rows = m.transactions.filter(row => row.sourceAccountId === card.accountId || row.destinationAccountId === card.accountId).slice(0, 5)
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('Recent card activity', 'Остання активність')}</h2><Link className={ui.link} to="/#dashboard-history">{t('View all', 'Усі операції')}</Link></div>
    {rows.length ? <table className={styles.table}>
      <thead><tr><th>{t('Operation', 'Операція')}</th><th>{t('Date', 'Дата')}</th><th>{t('Amount', 'Сума')}</th></tr></thead>
      <tbody>{rows.map(row => {
        const outgoing = row.sourceAccountId === card.accountId
        return <tr key={row.id}>
          <td><span className={styles.merchant}><Icon name={row.kind === 'Purchase' ? 'card' : row.kind === 'Exchange' ? 'exchange' : 'transfer'}/><span><strong>{transactionLabel(row.kind, t)}</strong><small>{row.status === 'Completed' ? (row.destinationIban || 'Flenta') : row.status}</small></span></span></td>
          <td>{new Date(row.createdAt).toLocaleDateString(m.locale, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td>{outgoing ? '−' : '+'}{m.format(row.amount, row.currency)}</td>
        </tr>
      })}</tbody>
    </table> : <EmptyState icon={<Icon name="statement"/>} title={t('No activity yet', 'Операцій поки немає')}>{t('Payments and transfers from this card’s account will appear here.', 'Тут з’являться оплати й перекази з рахунку цієї картки.')}</EmptyState>}
  </section>
}

function CardControls({ model: m, card, onClose }: { model: DashboardModel; card: Card; onClose: () => void }) {
  const t = m.text
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('Card controls', 'Керування карткою')}</h2></div>
    <ToggleRow soon checked={false} label={t('Online payments', 'Онлайн-платежі')} description={t('Pay securely on the web', 'Безпечна оплата в інтернеті')}/>
    <ToggleRow soon checked={false} label={t('Contactless payments', 'Безконтактна оплата')} description={t('Tap to pay in stores', 'Оплата дотиком у магазинах')}/>
    <ToggleRow soon checked={false} label={t('Cash withdrawals', 'Зняття готівки')} description={t('Withdraw at any ATM', 'Зняття в будь-якому банкоматі')}/>
    <div className={styles.limit}><span>{t('Monthly spending limit', 'Місячний ліміт витрат')}<SoonBadge/></span><strong>—</strong></div>
    <button type="button" className={`${ui.buttonDanger} ${ui.block} ${styles.closeCard}`} disabled={m.disabled || card.status === 'Closed'} onClick={onClose}>{t('Close card', 'Закрити картку')}</button>
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
  const holder = (m.user?.displayName || '').toUpperCase()

  function open(next: CardDialog) { m.clearFeedback(); setDialog(next) }

  return <WorkspaceLayout section="cards" title={t('Cards', 'Картки')} subtitle={t('Your everyday spending, in one place.', 'Усі щоденні витрати в одному місці.')}
    actions={<button type="button" className={ui.button} disabled={m.disabled} onClick={() => open('add')}><Icon name="plus" size={16}/>{t('Add new card', 'Додати картку')}</button>}>
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
        <section className={ui.panel}>
          <div className={styles.overviewHead}>
            <div><h2>{card.id === primaryId ? t('Primary card', 'Основна картка') : `${t('Card', 'Картка')} •• ${lastDigits(card.maskedNumber)}`}</h2>
              <p>{t('Virtual debit card', 'Віртуальна дебетова картка')} · {account?.currency}</p></div>
            <CardStatus card={card} model={m}/>
          </div>
          <dl className={styles.details}>
            <dt>{t('Card number', 'Номер картки')}</dt><dd>{maskedDigits(card)}</dd>
            <dt>{t('Expiry date', 'Термін дії')}</dt><dd>{expiry(card, true)}</dd>
            <dt>{t('Cardholder', 'Власник')}</dt><dd>{m.user?.displayName}</dd>
          </dl>
          <div className={styles.cardActions}>
            <button type="button" className={ui.button} disabled={m.disabled || card.status !== 'Active'} onClick={() => open('details')}><Icon name="eye" size={16}/>{t('Show card details', 'Показати реквізити')}</button>
            <button type="button" className={ui.button} disabled={m.disabled || card.status === 'Closed'} onClick={() => void m.run(() => m.bank.changeCard(card.id, card.status === 'Blocked' ? 'unblock' : 'block'),
              card.status === 'Blocked' ? t('Card unfrozen.', 'Картку розморожено.') : t('Card frozen.', 'Картку заморожено.'))}>
              <Icon name="snowflake" size={16}/>{card.status === 'Blocked' ? t('Unfreeze card', 'Розморозити картку') : t('Freeze card', 'Заморозити картку')}
            </button>
          </div>
        </section>
      </div>
      <div className={styles.lower}>
        <CardActivity model={m} card={card}/>
        <CardControls model={m} card={card} onClose={() => open('close')}/>
      </div>
    </> : m.loaded && <section className={ui.panel}>
      <EmptyState icon={<Icon name="card"/>} title={t('No cards yet', 'Карток поки немає')}>{t('Create a free virtual debit card to start paying.', 'Створи безкоштовну віртуальну дебетову картку, щоб почати платити.')}</EmptyState>
    </section>}

    {dialog === 'add' && <AddCardDialog model={m} onClose={() => setDialog(null)} onCreated={created => { setSelectedId(created.id); setDialog(null) }}/>}
    {dialog === 'details' && card && <CardDetailsDialog model={m} card={card} onClose={() => setDialog(null)}/>}
    {dialog === 'close' && card && <CloseCardDialog model={m} card={card} onClose={() => setDialog(null)}/>}
  </WorkspaceLayout>
}
