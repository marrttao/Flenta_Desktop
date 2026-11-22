import type { DashboardModel } from '../../dashboard/model/useDashboard'
import { formatIban } from '../../banking/utils/transactionLabel'
import { EmptyState } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import styles from './Transfers.module.css'

/** IBAN recipients the user has already paid, taken from the loaded transaction history. */
export function recentRecipients(m: DashboardModel, limit = 3) {
  const seen = new Map<string, string>()
  for (const row of m.transactions) {
    if (row.kind !== 'IbanTransfer' || row.status !== 'Completed' || !row.destinationIban) continue
    if (!seen.has(row.destinationIban)) seen.set(row.destinationIban, row.createdAt)
    if (seen.size >= limit) break
  }
  return [...seen].map(([iban, createdAt]) => ({ iban, createdAt }))
}

export function RecentRecipients({ model: m, onPick }: { model: DashboardModel; onPick: (iban: string) => void }) {
  const t = m.text
  const recipients = recentRecipients(m)
  return <section className={styles.recipients}>
    <h2 className={styles.panelTitle}>{t('Recent recipients', 'Недавні одержувачі')}</h2>
    <p className={styles.subtitle}>{t('Choose someone you have paid before.', 'Обери того, кому вже надсилав кошти.')}</p>
    {recipients.length ? <div className={styles.recipientList}>{recipients.map(r => <button key={r.iban} type="button" className={styles.recipient} disabled={m.disabled} onClick={() => onPick(r.iban)}>
      <span className={styles.recipientIcon}><Icon name="card" size={20}/></span>
      <span className={styles.recipientText}><strong>IBAN ···· {r.iban.slice(-4)}</strong><small>{formatIban(r.iban)}</small></span>
      <Icon name="arrow" size={18}/>
    </button>)}</div> : <EmptyState icon={<Icon name="user"/>} title={t('No recipients yet', 'Одержувачів поки немає')}>{t('People you send money to by IBAN will appear here.', 'Тут з’являться ті, кому ти надсилаєш кошти за IBAN.')}</EmptyState>}
  </section>
}
