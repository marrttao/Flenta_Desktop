import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Icon } from '../../workspace/ui/Icon'
import { adminApi } from '../api/adminApi'
import { useAdminLoad } from '../model/useAdmin'
import { AdminBadge, AdminState, SkeletonRows } from './AdminStates'
import styles from './Admin.module.css'

function pagesAround(page: number, total: number): (number | string)[] {
  const pages = Array.from(new Set([1, page - 1, page, page + 1, page <= 2 ? 3 : page >= total - 1 ? total - 2 : page, total]))
    .filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  return pages.flatMap((p, index) => index && p - pages[index - 1] > 1 ? ['gap-' + p, p] : [p])
}

export function AdminClientsPage() {
  const { request } = useAuth()
  const { text: t, locale } = useWorkspaceText()
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const [page, setPage] = useState(1)
  useEffect(() => {
    if (search.trim() === email) return
    const timer = setTimeout(() => { setEmail(search.trim()); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search, email])
  const load = useCallback(() => adminApi.clients(request, email, page), [request, email, page])
  const { state, reload } = useAdminLoad('clients:' + email + ':' + page, load)
  const data = state.status === 'ready' ? state.data : undefined
  const loading = state.status === 'loading' || email !== search.trim()
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : page
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages)
  }, [data, page, totalPages])
  const integer = (value: number) => value.toLocaleString(locale)
  const clearSearch = () => { setSearch(''); setEmail(''); setPage(1) }
  return <section className={styles.panel + ' ' + styles.clientsPanel}>
    <div className={styles.clientsHeader}><div><h2>{t('All Clients', 'Усі клієнти')}</h2>
      <p>{data ? t(integer(data.totalClients) + ' registered clients', integer(data.totalClients) + ' зареєстрованих клієнтів')
        : t('Client information', 'Інформація про клієнтів')}</p></div>
      <form role="search" onSubmit={event => { event.preventDefault(); setEmail(search.trim()); setPage(1) }}>
        <label htmlFor="admin-email-search">{t('Search by email', 'Пошук за email')}</label>
        <div className={styles.searchInput}><input id="admin-email-search" type="search" maxLength={254} value={search} onChange={event => setSearch(event.target.value)}
          placeholder={t('Enter an email address', 'Введи адресу електронної пошти')}/><Icon name="search" size={18}/></div>
      </form></div>
    {state.status === 'error' ? <AdminState kind={state.forbidden ? 'forbidden' : 'error'} retry={state.forbidden ? undefined : reload}/>
      : data && !data.items.length && !loading ? <AdminState kind="empty" search={Boolean(email)} retry={email ? clearSearch : undefined}/>
      : <div className={styles.tableScroll}><table className={styles.table} aria-busy={loading}>
        <caption className={styles.srOnly}>{t('Clients and verification status', 'Клієнти та статус перевірки')}</caption>
        <thead><tr>{[t('Name', 'Ім’я'), t('Email', 'Email'), t('Email Verification', 'Підтвердження email'), t('KYC Status', 'Статус KYC')].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{loading ? <SkeletonRows rows={8} columns={4}/> : data?.items.map(client => <tr key={client.id}>
          <td title={client.id}>{client.displayName}</td><td>{client.email ?? '—'}</td>
          <td><AdminBadge status={client.emailConfirmed ? 'Verified' : 'NotVerified'}/></td><td><AdminBadge status={client.kycStatus === 'Rejected' ? 'VerificationRejected' : client.kycStatus}/></td>
        </tr>)}</tbody>
      </table></div>}
    <div className={styles.tableFooter}><span>{loading ? t('Loading clients…', 'Завантажуємо клієнтів…') : data
      ? t(`Showing ${data.total ? (page - 1) * data.pageSize + 1 : 0}–${Math.min(page * data.pageSize, data.total)} of ${integer(data.total)} clients`,
        `Показано ${data.total ? (page - 1) * data.pageSize + 1 : 0}–${Math.min(page * data.pageSize, data.total)} із ${integer(data.total)} клієнтів`) : ''}</span>
      <nav className={styles.pagination} aria-label={t('Client pages', 'Сторінки клієнтів')}>
        <button type="button" disabled={loading || page <= 1} aria-label={t('Previous page', 'Попередня сторінка')} onClick={() => setPage(value => value - 1)}>‹</button>
        {pagesAround(page, totalPages).map(p => typeof p === 'string' ? <span key={p}>…</span> : <button type="button" key={p}
          disabled={loading} aria-label={t('Page ' + p, 'Сторінка ' + p)} aria-current={page === p ? 'page' : undefined} onClick={() => setPage(p)}>{p}</button>)}
        <button type="button" disabled={loading || !data || page >= totalPages} aria-label={t('Next page', 'Наступна сторінка')} onClick={() => setPage(value => value + 1)}>›</button>
      </nav></div>
  </section>
}
