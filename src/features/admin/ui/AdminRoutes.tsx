import { useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/providers/authContext'
import { adminApi } from '../api/adminApi'
import { useAdminLoad } from '../model/useAdmin'
import { AdminLayout } from './AdminLayout'
import { AdminOverviewPage } from './AdminOverviewPage'
import { AdminClientsPage } from './AdminClientsPage'
import { AdminState } from './AdminStates'
import styles from './Admin.module.css'
import { AdminNotificationsPage } from './AdminNotificationsPage'
import { AdminClientPage } from './AdminClientPage'
import { AdminKycPage } from './AdminKycPage'
import { AdminTransactionsPage } from './AdminTransactionsPage'
import { SupportRequests } from '../../support/ui/SupportRequests'

function AdminAccess() {
  const { request } = useAuth()
  const { pathname } = useLocation()
  const load = useCallback(() => adminApi.access(request), [request])
  const { state, reload } = useAdminLoad('access', load)
  const section = pathname.startsWith('/admin/clients') ? 'clients' : pathname === '/admin/kyc' ? 'kyc' : pathname === '/admin/transactions' ? 'transactions' : pathname === '/admin/notifications' ? 'notifications' : pathname === '/admin/support' ? 'support' : 'overview'
  return <AdminLayout section={section}>
    {state.status === 'loading' ? <div role="status" className={styles.state}><span className={styles.spinner}/><p>Loading…</p></div>
      : state.status === 'error' ? <AdminState kind={state.forbidden ? 'forbidden' : 'error'} retry={state.forbidden ? undefined : reload}/>
      : pathname.startsWith('/admin/clients/') ? <AdminClientPage/> : section === 'clients' ? <AdminClientsPage/> : section === 'kyc' ? <AdminKycPage/> : section === 'transactions' ? <AdminTransactionsPage/> : section === 'notifications' ? <AdminNotificationsPage/> : section === 'support' ? <SupportRequests staff/> : <AdminOverviewPage/>}
  </AdminLayout>
}

export function AdminRoutes() {
  const { user, isRestoringSession } = useAuth()
  const { pathname } = useLocation()
  if (isRestoringSession) return <div role="status" className={styles.sessionLoading}>Loading…</div>
  if (!user) return <Navigate replace to={'/auth/sign-in?' + new URLSearchParams({ returnTo: pathname })}/>
  return <AdminAccess key={user.id}/>
}
