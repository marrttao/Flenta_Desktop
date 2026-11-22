import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { ToggleRow, Feedback } from '../../workspace/ui/WorkspaceControls'
import { AdminBadge } from './AdminStates'
import { Dialog } from '../../workspace/ui/Dialog'
import { AdminConfirmation } from './AdminConfirmation'
import type { ClientDetail } from '../model/workflowTypes'
import styles from './AdminWorkflow.module.css'
export function AdminClientPage() {
  const { id } = useParams()
  const { text: t, format, locale } = useWorkspaceText()
  const { state, reload } = useResource<ClientDetail>('/api/admin/clients/' + id)
  const [action, setAction] = useState<{ title: string; path: string; payload: object; preview: string } | null>(null)
  const [accountId, setAccount] = useState('')
  const [credit, setCredit] = useState(true)
  const [amount, setAmount] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  if (state.status === 'loading') return <p role="status">{t('Loading client…', 'Завантажуємо клієнта…')}</p>
  if (state.status === 'error') return <><Feedback error={state.error}/><button onClick={reload}>{t('Retry', 'Повторити')}</button></>
  const d=state.data
  const account=d.accounts.find(a => a.id === accountId) ?? d.accounts[0]
  const controls=(patch: Partial<{blocked:boolean;cardsFrozen:boolean}>) => setAction({ preview: t('Restrict debits: ', 'Обмежити списання: ')+String(patch.blocked ?? d.blocked)+' · '+t('Freeze cards: ', 'Заморозити картки: ')+String(patch.cardsFrozen ?? d.cardsFrozen), title:t('Confirm account controls', 'Підтвердити обмеження'), path:'/api/admin/clients/' + id + '/controls', payload:{ blocked:d.blocked,cardsFrozen:d.cardsFrozen,...patch } })
  return <div className={styles.client}>
    <Link to="/admin/clients">← {t('All clients', 'Усі клієнти')}</Link>
    <section className={styles.summary}><div><small>{t('CLIENT ID', 'ID КЛІЄНТА')}</small><strong>{d.client.id}</strong></div>
      <div><small>{t('Verification', 'Перевірка')}</small><AdminBadge status={d.client.kycStatus}/></div>
      <div><small>{t('Account status', 'Статус рахунку')}</small><strong>{d.blocked ? t('Restricted', 'Обмежено') : t('Active', 'Активний')}</strong></div>
    </section>
    <div className={styles.grid}><section className={styles.panel}><h2>{t('Personal information', 'Особисті дані')}</h2>
      <dl className={styles.details}><dt>{t('Full name', 'Повне ім’я')}</dt><dd>{d.identity?.fullName || d.client.displayName}</dd><dt>Email</dt><dd>{d.client.email || '—'}</dd><dt>{t('Phone number', 'Номер телефону')}</dt><dd>{d.phone || t('Not provided', 'Не вказано')}</dd><dt>{t('Date of birth', 'Дата народження')}</dt><dd>{d.identity?.dateOfBirth || '—'}</dd><dt>{t('Country', 'Країна')}</dt><dd>{d.identity?.country || '—'}</dd><dt>{t('Tax ID (RNOKPP)', 'РНОКПП')}</dt><dd>{d.identity?.taxNumber || '—'}</dd><dt>{t('Joined', 'Зареєстровано')}</dt><dd>{new Date(d.client.createdAt).toLocaleDateString(locale)}</dd></dl>
      <p className={styles.muted}>{t('Contact data comes from the client profile. Identity decisions are managed separately in KYC requests.', 'Контактні дані беруться з профілю клієнта. Рішення про особу — у розділі KYC.')}</p>
      <Link className={styles.link} to="/admin/kyc">{t('Review KYC applications', 'Перевірити заявки KYC')} ↗</Link>
    </section><div className={styles.stack}><section className={styles.panel}><h2>{t('Account & card controls', 'Обмеження рахунку та карток')}</h2>
      <ToggleRow label={t('Restrict account debits', 'Обмежити списання')} description={t('Block outgoing operations and new accounts.', 'Заборонити вихідні операції та нові рахунки.')} checked={d.blocked} onChange={blocked => controls({ blocked })}/>
      <ToggleRow label={t('Freeze cards', 'Заморозити картки')} description={t('Clients cannot override an administrative freeze.', 'Клієнт не може скасувати адміністративну заморозку.')} checked={d.cardsFrozen} onChange={cardsFrozen => controls({ cardsFrozen })}/>
    </section><section className={styles.panel}><h2>{t('Account balance', 'Баланс рахунку')}</h2>
      {account ? <><label className={styles.field}>{t('Account', 'Рахунок')}<select value={account.id} onChange={e => setAccount(e.target.value)}>{d.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban?.slice(-6)}</option>)}</select></label><strong className={styles.balance}>{format(account.balance,account.currency)}</strong>
      <button className={styles.primary} onClick={() => setAdjusting(!adjusting)}>{t('Modify balance', 'Скоригувати баланс')}</button>
</> : <p>{t('No bank accounts.', 'Банківських рахунків немає.')}</p>}
    </section></div></div>
    <section className={styles.panel}><h2>{t('Audit history', 'Журнал дій')}</h2>
      {d.audit.length ? <div className={styles.audit}>{d.audit.map(a => <article key={a.id}><strong>{a.action}</strong><p>{a.reason}</p><small>{new Date(a.createdAt).toLocaleString(locale)} · {a.actorId}</small>{a.transactionId && <p>{t('Ledger reference', 'Операція ledger')}: {a.transactionId}</p>}</article>)}</div> : <p className={styles.muted}>{t('No administrative changes recorded.', 'Адміністративних змін не зафіксовано.')}</p>}
    </section>
    {adjusting && account && <Dialog wide title={t('Modify balance','Скоригувати баланс')} onClose={()=>setAdjusting(false)}>
      <div className={styles.balanceModal}><div>      <form onSubmit={e => { e.preventDefault(); setAction({ title:t('Confirm adjustment', 'Підтвердити коригування'),path:'/api/admin/clients/' + id + '/adjustments',payload:{ accountId:account!.id,credit,amount:Number(amount) },preview:format(Number(amount),account!.currency)+' · '+(credit?t('Credit (+)','Зарахування (+)'):t('Debit (−)','Списання (−)')) }) }}>
        <label className={styles.field}>{t('Adjustment type', 'Тип коригування')}<select value={String(credit)} onChange={e => setCredit(e.target.value === 'true')}><option value="true">{t('Credit balance (+)', 'Зарахувати (+)')}</option><option value="false">{t('Debit balance (−)', 'Списати (−)')}</option></select></label>
        <label className={styles.field}>{t('Amount', 'Сума')} · {account.currency}<input type="number" min=".01" max="10000000000" step=".01" required value={amount} onChange={e => setAmount(e.target.value)}/></label>
        <p>{t('New balance', 'Новий баланс')}: {format(account.balance + (credit ? 1 : -1) * (Number(amount)||0),account.currency)}</p><button className={styles.primary}>{t('Review adjustment', 'Перевірити коригування')}</button>
      </form></div><aside><h3>{t('Adjustment summary','Підсумок коригування')}</h3><p>{d.identity?.fullName || d.client.displayName}</p><p>{account.iban}</p><dl className={styles.details}><dt>{t('Current balance','Поточний баланс')}</dt><dd>{format(account.balance,account.currency)}</dd><dt>{t('New balance','Новий баланс')}</dt><dd>{format(account.balance+(credit?1:-1)*(Number(amount)||0),account.currency)}</dd></dl><p className={styles.muted}>{t('Next, provide an audit reason and confirm your administrator password. A separate ledger operation records the change.','Далі вкажи причину й підтвердь пароль адміністратора. Зміну буде записано окремою операцією ledger.')}</p></aside></div>
    </Dialog>}
    {action && <AdminConfirmation {...action} onClose={() => setAction(null)} onDone={() => { setAction(null); setAdjusting(false); setAmount(''); reload() }}><p><strong>{d.identity?.fullName || d.client.displayName}</strong></p><p>{action.preview}</p><small>{account?.iban}</small></AdminConfirmation>}
  </div>
}
