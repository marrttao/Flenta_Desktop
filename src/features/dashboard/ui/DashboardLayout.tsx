import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardModel } from '../model/useDashboard'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Icon } from '../../workspace/ui/Icon'
import styles from './Dashboard.module.css'

export { Icon } from '../../workspace/ui/Icon'
export { Dialog } from '../../workspace/ui/Dialog'

export function Feedback({ model: m }: { model: DashboardModel }) {
  return <div aria-live="polite">{m.error && <p role="alert" className={styles.error}>{m.error}</p>}{m.notice && <p role="status" className={styles.notice}>{m.notice}</p>}</div>
}

export function DashboardLayout({ model: m, children }: { model: DashboardModel; children: ReactNode }) {
  const t = m.text
  return <WorkspaceLayout section="home">
    <div id="dashboard-home" className={styles.dashboard}>
      <h1 className={styles.srOnly}>{t('Your Flenta dashboard', 'Твій банк Flenta')}</h1>
      <div className={styles.sandbox}>
        <span>{t('Sandbox · All balances, cards and transfers are virtual.', 'Пісочниця · Усі баланси, картки та перекази віртуальні.')}</span>
        <button className={styles.iconButton} type="button" disabled={m.disabled} onClick={() => void m.refresh()} aria-label={t('Refresh data', 'Оновити дані')}><Icon name="refresh" size={18}/></button>
      </div>
      {!m.user && <div className={styles.notice}><Link to="/auth/sign-in">{t('Sign in', 'Увійди')}</Link>{t(' or ', ' або ')}<Link to="/auth/sign-up">{t('create an account', 'зареєструйся')}</Link>{t(' to manage your cards and savings.', ', щоб керувати картками та накопиченнями.')}</div>}
      <div aria-live="polite">{m.error && <p className={styles.error} role="alert">{m.error}</p>}{m.notice && <p className={styles.notice} role="status">{m.notice}</p>}</div>
      {m.loading && <p className={styles.loading} role="status">{t('Updating your accounts…', 'Оновлюємо рахунки…')}</p>}
      {children}
    </div>
  </WorkspaceLayout>
}
