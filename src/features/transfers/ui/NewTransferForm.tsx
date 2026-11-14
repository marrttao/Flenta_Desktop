import { Link } from 'react-router-dom'
import type { Account, DashboardModel } from '../../dashboard/model/useDashboard'
import { lastDigits } from '../../banking/utils/transactionLabel'
import { SoonBadge } from '../../workspace/ui/WorkspaceControls'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Transfers.module.css'

export type TransferMode = 'card' | 'iban' | 'own'

export interface TransferDraft { mode: TransferMode; source: string; destination: string; amount: string }

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
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('New transfer', 'Новий переказ')}</h2></div>
    <div className={ui.segmented} role="group" aria-label={t('Transfer method', 'Спосіб переказу')}>
      {modes.map(mode => <button key={mode.id} type="button" className={ui.segment} aria-pressed={draft.mode === mode.id} disabled={mode.id === 'card'}
        onClick={() => set({ mode: mode.id, destination: '' })}>{mode.label}{mode.id === 'card' && <SoonBadge/>}</button>)}
    </div>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); onSubmit() }}>
      <fieldset disabled={m.disabled || !m.accounts.length}>
        <label className={ui.field}>{t('From', 'Звідки')}
          <select value={draft.source} required onChange={e => set({ source: e.target.value, destination: '' })}>
            {m.accounts.map(a => <option key={a.id} value={a.id}>{accountLabel(m, a)}</option>)}
          </select>
        </label>
        {account && <p className={styles.hint}>{t('Available', 'Доступно')}: {m.format(account.balance, account.currency)}</p>}
        {draft.mode === 'iban' ? <label className={ui.field}>{t('Recipient IBAN', 'IBAN одержувача')}
          <input value={draft.destination} required maxLength={64} placeholder="UA00 0000 0000 0000 0000 0000 0000 0" autoComplete="off" onChange={e => set({ destination: e.target.value })}/>
          <small>{t('The recipient must have an account in this sandbox.', 'Одержувач має мати рахунок у цій пісочниці.')}</small>
        </label> : <label className={ui.field}>{t('To my account', 'На мій рахунок')}
          <select value={draft.destination} required onChange={e => set({ destination: e.target.value })}>
            <option value="">{t('Choose an account', 'Обери рахунок')}</option>
            {destinations.map(a => <option key={a.id} value={a.id}>{accountLabel(m, a)}</option>)}
          </select>
          {!destinations.length && <small>{t('Open another account in the same currency, or use', 'Відкрий інший рахунок у цій валюті або скористайся')} <Link className={ui.link} to="/exchange">{t('currency exchange', 'обміном валют')}</Link>.</small>}
        </label>}
        <div className={ui.fieldRow}>
          <label className={ui.field}>{t('Amount', 'Сума')}<input value={draft.amount} inputMode="decimal" required placeholder="0,00" autoComplete="off" onChange={e => set({ amount: e.target.value })}/></label>
          <label className={ui.field}>{t('Currency', 'Валюта')}<input value={account?.currency || 'UAH'} readOnly aria-readonly="true"/></label>
        </div>
        <label className={ui.field}><span>{t('Message (optional)', 'Повідомлення (необов’язково)')}<SoonBadge/></span><input disabled placeholder={t('For our weekend plans', 'На плани на вихідні')}/></label>
        <div className={styles.footer}>
          <span className={styles.fee} aria-live="polite">{fee}</span>
          <button className={ui.button} type="submit">{t('Continue', 'Продовжити')}</button>
        </div>
      </fieldset>
    </form>
  </section>
}
