import type { Account, DashboardModel } from '../../dashboard/model/useDashboard'
import { lastDigits } from '../../banking/utils/transactionLabel'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Transfers.module.css'

export type TransferMode = 'card' | 'iban' | 'own'

export interface TransferDraft { mode: TransferMode; source: string; destination: string; amount: string; memo: string }

export function accountLabel(m: DashboardModel, account: Account) {
  const card = m.cards.find(c => c.accountId === account.id && c.status !== 'Closed')
  return card ? `${m.text('Card', 'Картка')} •• ${lastDigits(card.maskedNumber)} · ${account.currency}` : `${account.currency} ${m.text('account', 'рахунок')} · …${account.iban.slice(-6)}`
}

interface Props {
  model: DashboardModel
  draft: TransferDraft
  fee: string
  onChange: (draft: TransferDraft) => void
  onSubmit: () => void
}

export function NewTransferForm({ model: m, draft, fee, onChange, onSubmit }: Props) {
  const t = m.text
  const account = m.accounts.find(a => a.id === draft.source)
  const destinations = m.accounts.filter(a => a.id !== draft.source && a.currency === account?.currency)
  const set = (patch: Partial<TransferDraft>) => onChange({ ...draft, ...patch })
  const modes: { id: TransferMode; label: string }[] = [
    { id: 'card', label: t('To a card', 'На картку') },
    { id: 'iban', label: t('Bank account', 'На рахунок IBAN') },
    { id: 'own', label: t('Between my cards', 'Між своїми') },
  ]
  return <section className={styles.newTransfer}>
    <h2 className={styles.title}>{t('New transfer', 'Новий переказ')}</h2>
    <div className={styles.modes} role="group" aria-label={t('Transfer method', 'Спосіб переказу')}>
      {modes.map(mode => <button key={mode.id} type="button" className={styles.mode} aria-pressed={draft.mode === mode.id}
        onClick={() => set({ mode: mode.id, destination: '' })}>{mode.label}</button>)}
    </div>
    <form onSubmit={event => { event.preventDefault(); onSubmit() }}>
      <fieldset className={styles.fields} disabled={m.disabled || !m.accounts.length}>
        <label className={`${ui.field} ${styles.first}`}>{t('From card', 'З картки')}
          <select value={draft.source} required onChange={e => set({ source: e.target.value, destination: '' })}>
            {m.accounts.map(a => <option key={a.id} value={a.id}>{accountLabel(m, a)}</option>)}
          </select>
        </label>
        <p className={styles.available}>{account ? `${t('Available', 'Доступно')}: ${m.format(account.balance, account.currency)}` : ' '}</p>
        {draft.mode === 'card' ? <label className={ui.field}>{t('Recipient card number', 'Номер картки одержувача')}<input value={draft.destination} required maxLength={24} inputMode="numeric" autoComplete="off" placeholder="9999 99•• •••• ••••" onChange={e=>set({destination:e.target.value})}/></label> : draft.mode === 'iban' ? <label className={`${ui.field} ${styles.afterHint}`}>{t('Recipient IBAN', 'IBAN одержувача')}
          <input value={draft.destination} required maxLength={64} placeholder="UA00 0000 0000 0000 0000 0000 0000 0" autoComplete="off" onChange={e => set({ destination: e.target.value })}/>
        </label> : <label className={`${ui.field} ${styles.afterHint}`}>{t('To my account', 'На мій рахунок')}
          <select value={draft.destination} required onChange={e => set({ destination: e.target.value })}>
            <option value="">{destinations.length ? t('Choose an account', 'Обери рахунок') : t('No other account in this currency', 'Немає іншого рахунку в цій валюті')}</option>
            {destinations.map(a => <option key={a.id} value={a.id}>{accountLabel(m, a)}</option>)}
          </select>
        </label>}
        <div className={styles.amountRow}>
          <label className={ui.field}>{t('Amount', 'Сума')}<input value={draft.amount} inputMode="decimal" required placeholder="0,00" autoComplete="off" onChange={e => set({ amount: e.target.value })}/></label>
          <label className={ui.field}>{t('Currency', 'Валюта')}<input value={account?.currency || 'UAH'} readOnly aria-readonly="true"/></label>
        </div>
        <label className={`${ui.field} ${styles.next}`}><span>{t('Message (optional)', 'Повідомлення (необов’язково)')}</span><input maxLength={280} value={draft.memo} onChange={e=>set({memo:e.target.value})} placeholder={t('For our weekend plans', 'На плани на вихідні')}/></label>
        <div className={styles.footer}>
          <span className={styles.fee} aria-live="polite">{fee}</span>
          <button className={`${ui.button} ${styles.continue}`} type="submit">{t('Continue', 'Продовжити')}</button>
        </div>
      </fieldset>
    </form>
  </section>
}
