import type { ReactNode } from 'react'
import type { DashboardModel } from '../model/useDashboard'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import styles from './Dashboard.module.css'

export { Icon } from '../../workspace/ui/Icon'
export { Dialog } from '../../workspace/ui/Dialog'

export function Feedback({ model: m }: { model: DashboardModel }) {
  return <div aria-live="polite">{m.error && <p role="alert" className={styles.error}>{m.error}</p>}{m.notice && <p role="status" className={styles.notice}>{m.notice}</p>}</div>
}

export function DashboardLayout({ model: m, children }: { model: DashboardModel; children: ReactNode }) {
  return <WorkspaceLayout section="home">
    <div className={styles.home}>
      <h1 className={styles.srOnly}>{m.text('Your Flenta dashboard', 'Твій банк Flenta')}</h1>
      {!m.action && <Feedback model={m}/>}
      {children}
    </div>
  </WorkspaceLayout>
}
