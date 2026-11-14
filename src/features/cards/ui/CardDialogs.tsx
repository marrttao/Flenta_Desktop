import { useEffect, useRef, useState } from 'react'
import type { Account, Card, DashboardModel } from '../../dashboard/model/useDashboard'
import { bankingError } from '../../banking/utils/banking.js'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Cards.module.css'

interface CardSecrets { number: string; cvv: string; expiryMonth: number; expiryYear: number }

export function AddCardDialog({ model: m, onCreated, onClose }: { model: DashboardModel; onCreated: (card: Card) => void; onClose: () => void }) {
  const t = m.text
  const hasAccounts = m.accounts.length > 0
  return <Dialog title={t('Add a new card', 'Додати нову картку')} onClose={() => { if (!m.busy) onClose() }}>
    <p className={ui.muted}>{t('Virtual debit cards are free and linked to one of your accounts.', 'Віртуальні дебетові картки безкоштовні та прив’язані до одного з твоїх рахунків.')}</p>
    <Feedback error={m.error}/>
    <form onSubmit={async event => {
      event.preventDefault(); const data = new FormData(event.currentTarget)
      const result: { card?: Card } = {}
      const ok = await m.run(async () => {
        const accountId = hasAccounts ? String(data.get('accountId'))
          : (await m.finance.openAccount(m.request, String(data.get('currency'))) as Account).id
        result.card = await m.bank.createCard(accountId) as Card
        return result.card
      }, t('Virtual card created.', 'Віртуальну картку створено.'))
      if (ok && result.card) onCreated(result.card)
    }}><fieldset disabled={m.disabled}>
      {hasAccounts
        ? <label>{t('Account for the new card', 'Рахунок для нової картки')}<select name="accountId" required defaultValue={m.activeAccount?.id}>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)} · {m.format(a.balance, a.currency)}</option>)}</select></label>
        : <label>{t('Open an account in', 'Відкрити рахунок у валюті')}<select name="currency"><option>UAH</option><option>USD</option><option>EUR</option></select></label>}
      <button className={ui.buttonPrimary} type="submit">{m.busy ? t('Processing…', 'Обробка…') : hasAccounts ? t('Create virtual card', 'Створити віртуальну картку') : t('Open account and create card', 'Відкрити рахунок і створити картку')}</button>
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
