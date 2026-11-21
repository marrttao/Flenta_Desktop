import { useEffect, useRef, useState } from 'react'
import type { Account, Card, DashboardModel } from '../../dashboard/model/useDashboard'
import { bankingError, parseAmount } from '../../banking/utils/banking.js'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Cards.module.css'

interface CardSecrets { number: string; cvv: string; expiryMonth: number; expiryYear: number }

export function AddCardDialog({ model: m, onCreated, onClose }: { model: DashboardModel; onCreated: (card: Card) => void; onClose: () => void }) {
  const t = m.text
  return <Dialog title={t('Add a new card', 'Додати нову картку')} onClose={() => { if (!m.busy) onClose() }}>
    <p className={ui.muted}>{t('Virtual debit cards are free. Link the card to one of your accounts or open a new account in another currency.', 'Віртуальні дебетові картки безкоштовні. Прив’яжи картку до свого рахунку або відкрий новий рахунок в іншій валюті.')}</p>
    <Feedback error={m.error}/>
    <form onSubmit={async event => {
      event.preventDefault(); const choice = String(new FormData(event.currentTarget).get('account'))
      const result: { card?: Card } = {}
      const ok = await m.run(async () => {
        const accountId = choice.startsWith('new:')
          ? (await m.finance.openAccount(m.request, choice.slice(4)) as Account).id : choice
        result.card = await m.bank.createCard(accountId) as Card
        return result.card
      }, t('Virtual card created.', 'Віртуальну картку створено.'))
      if (ok && result.card) onCreated(result.card)
    }}><fieldset disabled={m.disabled}>
      <label>{t('Account for the new card', 'Рахунок для нової картки')}<select name="account" required defaultValue={m.activeAccount?.id || 'new:UAH'}>
        {m.accounts.length > 0 && <optgroup label={t('My accounts', 'Мої рахунки')}>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)} · {m.format(a.balance, a.currency)}</option>)}</optgroup>}
        <optgroup label={t('Open a new account', 'Відкрити новий рахунок')}>{['UAH', 'USD', 'EUR'].map(currency => <option key={currency} value={`new:${currency}`}>{t('New account in', 'Новий рахунок у')} {currency}</option>)}</optgroup>
      </select></label>
      <button className={ui.buttonPrimary} type="submit">{m.busy ? t('Processing…', 'Обробка…') : t('Create virtual card', 'Створити віртуальну картку')}</button>
    </fieldset></form>
  </Dialog>
}

export function TestPurchaseDialog({ model: m, card, onClose }: { model: DashboardModel; card: Card; onClose: () => void }) {
  const t = m.text
  const currency = m.accounts.find(a => a.id === card.accountId)?.currency
  return <Dialog title={t('Try a virtual purchase', 'Спробувати тестову покупку')} onClose={() => { if (!m.busy) onClose() }}>
    <p className={ui.muted}>{t('This sandbox payment can trigger cashback and the savings rules you configured. Savings contributions are charged in addition to the purchase.', 'Ця тестова покупка може нарахувати кешбек і застосувати твої правила накопичення. Відрахування списується додатково до покупки.')}</p>
    <Feedback error={m.error}/>
    <form onSubmit={async event => {
      event.preventDefault(); const data = new FormData(event.currentTarget)
      if (await m.run(() => m.operation('/api/finance/purchases', { cardId: card.id, amount: parseAmount(data.get('amount')), channel: String(data.get('channel')) }), t('Virtual purchase completed.', 'Тестову покупку оплачено.'))) onClose()
    }}><fieldset disabled={m.disabled}>
      <p>{card.maskedNumber} · {currency}</p>
      <label>{t('Payment channel', 'Канал операції')}<select name="channel"><option value="Online">{t('Online purchase', 'Онлайн-покупка')}</option><option value="Contactless">{t('Contactless purchase', 'Безконтактна покупка')}</option><option value="CashWithdrawal">{t('Sandbox cash withdrawal (no cashback or savings)', 'Тестове зняття (без кешбеку та накопичень)')}</option></select></label>
      <label>{t('Amount in the card account currency', 'Сума у валюті рахунку картки')}<input name="amount" inputMode="decimal" required autoFocus/></label>
      <button className={ui.buttonPrimary} type="submit">{t('Pay with virtual funds', 'Оплатити віртуальними коштами')}</button>
    </fieldset></form>
  </Dialog>
}

export function CardDetailsDialog({ model: m, card, onClose }: { model: DashboardModel; card: Card; onClose: () => void }) {
  const t = m.text
  const [secrets, setSecrets] = useState<CardSecrets | null>(null)
  const [error, setError] = useState('')
  const [revealing, setRevealing] = useState(false)
  const close = useRef(onClose)
  useEffect(() => { close.current = onClose })
  useEffect(() => {
    if (!secrets) return
    const timeout = window.setTimeout(() => close.current(), 60_000)
    return () => window.clearTimeout(timeout)
  }, [secrets])
  return <Dialog title={t('Card details', 'Реквізити картки')} onClose={() => { if (!revealing) onClose() }}>
    <Feedback error={error}/>
    {secrets ? <>
      <p className={ui.muted}>{t('These details will be hidden in 60 seconds.', 'Реквізити будуть приховані через 60 секунд.')}</p>
      <dl className={styles.requisites}>
        <dt>{t('Card number', 'Номер картки')}</dt><dd>{secrets.number.replace(/(.{4})/g, '$1 ').trim()}</dd>
        <dt>CVV</dt><dd>{secrets.cvv}</dd>
        <dt>{t('Valid through', 'Дійсна до')}</dt><dd>{String(secrets.expiryMonth).padStart(2, '0')}/{String(secrets.expiryYear).slice(-2)}</dd>
      </dl>
    </> : <form onSubmit={async event => {
      event.preventDefault(); const data = new FormData(event.currentTarget); event.currentTarget.reset()
      setRevealing(true); setError('')
      try { setSecrets(await m.bank.requisites(card.id, String(data.get('password'))) as CardSecrets) }
      catch (failure) { setError(bankingError(failure)) } finally { setRevealing(false) }
    }}><fieldset disabled={revealing}>
      <p className={ui.muted}>{t('Confirm your password to reveal details for', 'Підтвердь пароль для перегляду реквізитів картки')} {card.maskedNumber}.</p>
      <label>{t('Account password', 'Пароль облікового запису')}<input name="password" type="password" autoComplete="current-password" maxLength={128} required autoFocus/></label>
      <button className={ui.buttonPrimary} type="submit">{revealing ? t('Checking…', 'Перевіряємо…') : t('Reveal details', 'Показати реквізити')}</button>
    </fieldset></form>}
  </Dialog>
}

export function CloseCardDialog({ model: m, card, onClose }: { model: DashboardModel; card: Card; onClose: () => void }) {
  const t = m.text
  return <Dialog title={t('Close this card?', 'Закрити цю картку?')} onClose={() => { if (!m.busy) onClose() }}>
    <p>{card.maskedNumber}</p>
    <p className={ui.muted}>{t('You cannot reactivate this card. Its account and balance will remain available.', 'Цю картку неможливо активувати повторно. Рахунок і баланс залишаться доступними.')}</p>
    <Feedback error={m.error}/>
    <div className={styles.cardActions}>
      <button className={ui.button} type="button" disabled={m.busy} onClick={onClose}>{t('Cancel', 'Скасувати')}</button>
      <button className={ui.buttonDanger} type="button" disabled={m.disabled} onClick={async () => {
        if (await m.run(() => m.bank.changeCard(card.id, 'close'), t('Card closed.', 'Картку закрито.'))) onClose()
      }}>{t('Close card permanently', 'Закрити картку назавжди')}</button>
    </div>
  </Dialog>
}
