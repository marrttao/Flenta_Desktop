import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { transactionLabel } from '../../banking/utils/transactionLabel'
import { AdminConfirmation } from './AdminConfirmation'
import { AdminBadge } from './AdminStates'
import type { TransactionPage } from '../model/workflowTypes'
import styles from './AdminWorkflow.module.css'
export function AdminTransactionsPage() {
  const { text:t, locale, format } = useWorkspaceText()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [kind,setKind]=useState('')
  const [selected, setSelected] = useState('')
  const [action,setAction] = useState<boolean|null>(null)
  const { state, reload } = useResource<TransactionPage>('/api/admin/transactions?' + new URLSearchParams({ query,status,page:String(page),...(date?{date}:{}),...(kind?{kind}:{}) }))
  const row=state.status === 'ready' ? state.data.items.find(r => r.id === selected) : null
  return <>
    <div className={styles.metrics}>{[
      [t('Transactions','Операції'),'transactionsForDay'],
      [t('Completed','Виконано'),'completedForDay'],
      [t('Requires attention','Потребують уваги'),'attentionForDay']
    ].map(([label,key])=><article key={key}><h2>{label}</h2><strong>{state.status==='ready'?state.data[key as 'transactionsForDay'|'completedForDay'|'attentionForDay']:'—'}</strong><p>{state.status==='ready'?state.data.date:date} · UTC</p></article>)}</div>
    <div className={styles.transactionGrid}><section className={styles.panel}>
    <div className={styles.toolbar}><h2>{t('All transactions', 'Усі операції')}</h2><form onSubmit={e => { e.preventDefault(); setQuery(search.trim()); setPage(1) }}><input type="search" aria-label={t('Search clients or transaction ID', 'Пошук клієнтів або ID операції')} placeholder={t('Search client or transaction', 'Клієнт або операція')} maxLength={254} value={search} onChange={e => setSearch(e.target.value)}/><button>{t('Search', 'Пошук')}</button></form>
      <select aria-label={t('Status', 'Статус')} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>{['','Completed','Pending','Rejected'].map(s => <option key={s} value={s}>{s || t('All statuses', 'Усі статуси')}</option>)}</select></div>
    <div className={styles.toolbar}><select aria-label={t('Operation type','Тип операції')} value={kind} onChange={e=>{setKind(e.target.value);setPage(1)}}><option value="">{t('All operations','Усі операції')}</option>{['TopUp','Purchase','InternalTransfer','IbanTransfer','CardTransfer','SavingsDeposit','SavingsWithdrawal','Exchange','MobileTopUp','LoanRepayment','CashWithdrawal','AdminAdjustment','Compensation'].map(k=><option key={k} value={k}>{transactionLabel(k,t)}</option>)}</select><label>{t('Date · UTC (clear for all dates)','Дата · UTC (порожнє — всі дати)')}<input type="date" value={date} max={new Date().toISOString().slice(0,10)} onChange={e=>{setDate(e.target.value);setPage(1)}}/></label></div>
    {state.status === 'error' ? <><Feedback error={state.error}/><button onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : <>
      <div className={styles.tableWrap}><table><thead><tr><th>{t('Date · UTC', 'Дата · UTC')}</th><th>{t('Client', 'Клієнт')}</th><th>{t('Operation', 'Операція')}</th><th>{t('Amount', 'Сума')}</th><th>{t('Status', 'Статус')}</th><th/></tr></thead><tbody>
        {state.data.items.map(row => <tr key={row.id}><td>{new Date(row.createdAt).toLocaleString(locale,{timeZone:'UTC'})}</td><td>{row.clientName}</td><td>{transactionLabel(row.kind,t)}</td><td>{format(row.amount,row.currency)}</td><td><AdminBadge status={row.status}/></td><td><button onClick={() => setSelected(row.id)}>{t('Details', 'Деталі')}</button></td></tr>)}
        {!state.data.items.length && <tr><td colSpan={6}>{t('No transactions found.', 'Операцій не знайдено.')}</td></tr>}
      </tbody></table></div><div className={styles.pagination}><span>{state.data.total} {t('transactions', 'операцій')}</span><button disabled={page<=1} onClick={() => setPage(page-1)}>‹</button><span>{page}</span><button disabled={page*8>=state.data.total} onClick={() => setPage(page+1)}>›</button></div>
    </>}
    </section>{row && <aside className={styles.panel}><h2>{t('Transaction details', 'Деталі операції')}</h2><strong className={styles.balance}>{format(row.amount,row.currency)}</strong><AdminBadge status={row.status}/>
      <dl className={styles.details}><dt>ID</dt><dd>{row.id}</dd><dt>{t('Client', 'Клієнт')}</dt><dd><Link to={'/admin/clients/'+row.clientId}>{row.clientName}</Link></dd><dt>{t('Operation', 'Операція')}</dt><dd>{row.kind}</dd></dl>
      <p className={styles.muted}>{t('Posted ledger entries are immutable. Adjustments are recorded as separate operations with a reason and password confirmation.', 'Проведені записи ledger незмінні. Коригування створюються окремими операціями з причиною та підтвердженням пароля.')}</p>
      <Link className={styles.link} to={'/admin/clients/'+row.clientId}>{t('Open client account', 'Відкрити рахунок клієнта')} ↗</Link>
      <div className={styles.actions}><button onClick={()=>setAction(false)}>{t('Flag for review', 'Позначити для перевірки')}</button><button disabled={row.status!=='Completed' || row.kind==='Compensation'} onClick={()=>setAction(true)}>{t('Compensate transaction', 'Компенсувати операцію')}</button></div>
      <button onClick={() => setSelected('')}>{t('Close', 'Закрити')}</button>
    </aside>}
    {row && action!==null && <AdminConfirmation title={action?t('Compensate transaction','Компенсувати операцію'):t('Flag transaction','Позначити операцію')} path={'/api/admin/transactions/'+row.id+'/actions'} payload={{compensate:action}}
      onClose={()=>setAction(null)} onDone={()=>{setAction(null);reload()}}><p>{t('Reference','Операція')}: {row.id}</p>{action && <p>{t('Every ledger entry will be reversed in a new transaction. All affected accounts must have sufficient funds. The original transaction stays unchanged.','Кожен запис ledger буде компенсовано новою операцією. На всіх задіяних рахунках має вистачати коштів. Оригінальна операція зберігається.')}</p>}</AdminConfirmation>}
    </div></>
}
