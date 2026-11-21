import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../../assets/fonts/manrope/manrope.css'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Icon, LogoMark } from '../../workspace/ui/Icon'
import styles from './Admin.module.css'

export function AdminLayout({ section, children }: { section: 'overview' | 'clients'; children: ReactNode }) {
  const { logout } = useAuth()
  const { text: t } = useWorkspaceText()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function signOut() {
    if (busy) return
    setBusy(true)
    try { await logout(); navigate('/auth/sign-in', { replace: true }) }
    catch { setError(t('The session ended locally. Server sign-out could not be confirmed.', 'Локальний сеанс завершено. Сервер не підтвердив вихід.')) }
    finally { setBusy(false) }
  }
  return <div className={styles.admin}>
    <aside className={styles.sidebar}>
      <Link to="/admin" className={styles.logo} aria-label="Flenta"><LogoMark/><span>flenta</span></Link>
      <nav aria-label={t('Administration', 'Адміністрування')} className={styles.nav}>
        <Link to="/admin" aria-current={section === 'overview' ? 'page' : undefined}><Icon name="home"/>{t('Overview', 'Огляд')}</Link>
        <Link to="/admin/clients" aria-current={section === 'clients' ? 'page' : undefined}><Icon name="user"/>{t('Clients', 'Клієнти')}</Link>
      </nav>
      <span className={styles.administrator}>{t('Administrator', 'Адміністратор')}</span>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div><h1>{section === 'overview' ? t('Overview', 'Огляд') : t('Clients', 'Клієнти')}</h1>
          <p>{section === 'overview' ? t('A clear view of your clients and daily activity.', 'Клієнти та щоденна активність в одному місці.')
            : t('Client information and verification, in one place.', 'Інформація про клієнтів і перевірки в одному місці.')}</p></div>
        <button type="button" className={styles.logout} disabled={busy} onClick={() => void signOut()}><Icon name="logout" size={18}/>{t('Log Out', 'Вийти')}</button>
      </header>
      <main className={styles.content}>{error && <p role="alert">{error}</p>}{children}</main>
    </div>
  </div>
}
