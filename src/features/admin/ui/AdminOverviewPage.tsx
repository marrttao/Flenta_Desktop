import { useCallback } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Icon } from '../../workspace/ui/Icon'
import { adminApi } from '../api/adminApi'
import { useAdminLoad } from '../model/useAdmin'
import { AdminBadge, AdminState, SkeletonRows } from './AdminStates'
import styles from './Admin.module.css'

const kinds: Record<string, [string, string]> = {
  TopUp: ['Top-up', 'Поповнення'], InternalTransfer: ['Bank transfer', 'Банківський переказ'],
  IbanTransfer: ['Bank transfer', 'Банківський переказ'], Exchange: ['Currency exchange', 'Обмін валют'],
  Purchase: ['Card payment', 'Оплата карткою'], SavingsDeposit: ['Savings deposit', 'Поповнення накопичень'],
  SavingsWithdrawal: ['Savings withdrawal', 'Зняття накопичень'],
}

export function AdminOverviewPage() {
  const { request } = useAuth()
  const { text: t, locale } = useWorkspaceText()
  const dateLocale = locale.startsWith('en') ? 'en-GB' : locale
  const load = useCallback(() => adminApi.overview(request), [request])
  const { state, reload } = useAdminLoad('overview', load)
  const data = state.status === 'ready' ? state.data : undefined
  const loading = state.status === 'loading'
  const failed = state.status === 'error'
  const date = data ? new Date(data.date + 'T00:00:00Z').toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—'
  const integer = (value: number) => value.toLocaleString(locale)
  const metrics = [
    { label: t('Total Clients', 'Усього клієнтів'), value: data && integer(data.totalClients), caption: t('Registered clients', 'Зареєстровані клієнти'), icon: 'user' as const },
    { label: t('Verified KYC Clients', 'Клієнти з підтвердженим KYC'), value: data && integer(data.verifiedKycClients),
      caption: data ? t(((data.totalClients ? data.verifiedKycClients / data.totalClients * 100 : 0).toFixed(1)) + '% of all clients',
        ((data.totalClients ? data.verifiedKycClients / data.totalClients * 100 : 0).toFixed(1)) + '% усіх клієнтів') : '', icon: 'shield' as const },
    { label: t('Today’s Transactions', 'Операцій сьогодні'), value: data && integer(data.todayTransactions), caption: date + ' · UTC', icon: 'refresh' as const },
  ]
  return <>
    <section className={styles.metrics} aria-label={t('Overview statistics', 'Загальна статистика')} aria-busy={loading}>
      {metrics.map(metric => <article key={metric.label} className={styles.metric}><Icon name={metric.icon} size={20}/><h2>{metric.label}</h2>
        {loading ? <><span className={styles.metricSkeleton}/><span className={styles.skeleton}/></> : <><strong>{metric.value ?? '—'}</strong>
          <p>{failed ? t('Unavailable', 'Недоступно') : metric.caption}</p></>}</article>)}
    </section>
    <section className={styles.panel + ' ' + styles.overviewPanel}>
      <div className={styles.panelHeader}><div><h2>{t('Recent Transactions', 'Останні операції')}</h2>
        <p>{loading ? t('Loading the latest activity…', 'Завантажуємо останню активність…') : t('Latest activity across all clients', 'Остання активність усіх клієнтів')}</p></div><span>{date} · UTC</span></div>
      {failed ? <AdminState kind={state.forbidden ? 'forbidden' : 'error'} retry={state.forbidden ? undefined : reload}/>
        : data && !data.recentTransactions.length ? <AdminState kind="empty"/>
        : <div className={styles.tableScroll}><table className={styles.table} aria-busy={loading}>
          <caption className={styles.srOnly}>{t('Recent transactions, times in UTC', 'Останні операції, час UTC')}</caption>
          <thead><tr>{[t('Date & Time', 'Дата й час'), t('Client', 'Клієнт'), t('Operation Type', 'Тип операції'), t('Amount + Currency', 'Сума й валюта'), t('Status', 'Статус')].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{loading ? <SkeletonRows rows={7} columns={5}/> : data?.recentTransactions.map(row => {
            const timestamp = new Date(row.createdAt)
            const kind = kinds[row.kind]
            return <tr key={row.id}><td><time dateTime={row.createdAt}>{timestamp.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}<small>{timestamp.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} UTC</small></time></td>
              <td title={row.clientEmail ?? row.clientId}>{row.clientName}</td><td>{kind ? t(...kind) : row.kind}</td>
              <td className={styles.amount}>{row.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency}</td><td><AdminBadge status={row.status}/></td></tr>
          })}</tbody>
        </table></div>}
      <div className={styles.tableFooter}><span>{loading ? t('Loading transactions…', 'Завантажуємо операції…') : data ? t(data.recentTransactions.length + ' most recent transactions', data.recentTransactions.length + ' останніх операцій') : ''}</span><span>{t('All times in UTC', 'Увесь час в UTC')}</span></div>
    </section>
  </>
}
