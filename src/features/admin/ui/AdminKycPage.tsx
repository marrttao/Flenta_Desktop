import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { AdminBadge } from './AdminStates'
import { AdminKycReview } from './AdminKycReview'
import { AdminConfirmation } from './AdminConfirmation'
import type { KycPage, KycItem } from '../model/workflowTypes'
import styles from './AdminWorkflow.module.css'
export function AdminKycPage() {
  const { text: t, locale } = useWorkspaceText()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [search,setSearch]=useState('')
  const [query,setQuery]=useState('')
  const { state, reload } = useResource<KycPage>('/api/admin/kyc?' + new URLSearchParams({ status,page:String(page),query }))
  const [selected, setSelected] = useState<KycItem | null>(null)
  const [decision, setDecision] = useState<boolean | null>(null)
  return <>
    <div className={styles.metrics}>
      <article><h2>{t('Awaiting decision','Очікують рішення')}</h2><strong>{state.status==='ready'?state.data.awaitingDecision:'—'}</strong><p>{t('Active verification applications','Активні заявки на перевірку')}</p></article>
      <article><h2>{t('In review','На перевірці')}</h2><strong>{state.status==='ready'?state.data.inReview:'—'}</strong><p>{t('Provider sent for review','Провайдер направив на перевірку')}</p></article>
      <article><h2>{t('Approved today','Схвалено сьогодні')}</h2><strong>{state.status==='ready'?state.data.approvedToday:'—'}</strong><p>{t('Decisions recorded today · UTC','Рішення за сьогодні · UTC')}</p></article>
    </div><section className={styles.panel}>
    <div className={styles.toolbar}><div><h2>{t('Verification applications', 'Заявки на перевірку')}</h2><p className={styles.muted}>{t('Provider history is retained. Manual decisions are recorded separately.', 'Історія провайдера зберігається. Ручні рішення записуються окремо.')}</p></div>
      <label className={styles.field}>{t('Provider status', 'Статус провайдера')}<select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>{['','InProgress','PendingReview','Verified','Rejected','NeedsResubmission'].map(s => <option key={s} value={s}>{s || t('All statuses', 'Усі статуси')}</option>)}</select></label>
      <form onSubmit={e=>{e.preventDefault();setQuery(search.trim());setPage(1)}}><input type="search" aria-label={t('Search applications','Пошук заявок')} placeholder={t('Display name, email, ID or RNOKPP','Ім’я профілю, email, ID або РНОКПП')} value={search} maxLength={254} onChange={e=>setSearch(e.target.value)}/><button>{t('Search','Пошук')}</button></form>
    </div>
    {state.status === 'error' ? <><Feedback error={state.error}/><button onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : <>
      <div className={styles.tableWrap}><table><thead><tr><th>{t('Client', 'Клієнт')}</th><th>{t('Submitted · UTC', 'Подано · UTC')}</th><th>{t('Tax ID (RNOKPP)', 'РНОКПП')}</th><th>{t('Status', 'Статус')}</th><th>{t('Manual decision', 'Ручне рішення')}</th><th/></tr></thead><tbody>
        {state.data.items.map(row => <tr key={row.id}><td><Link to={'/admin/clients/' + row.ownerId}>{row.displayName}</Link><small>{row.email}</small></td><td>{new Date(row.createdAt).toLocaleString(locale,{timeZone:'UTC'})}</td><td>{row.taxNumber || '—'}</td><td><AdminBadge status={row.status}/></td><td>{row.manualDecision === null ? '—' : row.manualDecision ? t('Approved', 'Схвалено') : t('Rejected', 'Відхилено')}</td><td><button onClick={() => { setSelected(row); setDecision(null) }}>{t('Review application', 'Перевірити заявку')}</button></td></tr>)}
        {!state.data.items.length && <tr><td colSpan={6}>{t('No applications found.', 'Заявок не знайдено.')}</td></tr>}
      </tbody></table></div>
      <div className={styles.pagination}><span>{state.data.total} {t('applications', 'заявок')}</span><button disabled={page<=1} onClick={() => setPage(page-1)}>‹</button><span>{page}</span><button disabled={page*8>=state.data.total} onClick={() => setPage(page+1)}>›</button></div>
    </>}
    {selected && <AdminKycReview item={selected} onClose={()=>setSelected(null)} onDecision={setDecision}/>}
    {selected && decision !== null && <AdminConfirmation title={decision ? t('Approve identity verification', 'Схвалити перевірку особи') : t('Reject identity verification', 'Відхилити перевірку особи')} path={'/api/admin/kyc/' + selected.id + '/reviews'} payload={{ approved:decision }}
      onClose={() => setDecision(null)} onDone={() => { setDecision(null); setSelected(null); reload() }}/>}
  </section></>
}
