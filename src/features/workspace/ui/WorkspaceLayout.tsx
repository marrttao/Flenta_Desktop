import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../model/useWorkspaceText'
import { Icon, type IconName } from './Icon'
import styles from './Workspace.module.css'

export type WorkspaceSection = 'home' | 'cards' | 'transfers' | 'exchange' | 'support' | 'settings'

const sections: { id: WorkspaceSection; to: string; icon: IconName; en: string; uk: string }[] = [
  { id: 'home', to: '/', icon: 'home', en: 'Home', uk: 'Головна' },
  { id: 'cards', to: '/cards', icon: 'card', en: 'Cards', uk: 'Картки' },
  { id: 'transfers', to: '/transfers', icon: 'transfer', en: 'Transfers', uk: 'Перекази' },
  { id: 'exchange', to: '/exchange', icon: 'exchange', en: 'Currency exchange', uk: 'Обмін валют' },
  { id: 'support', to: '/support', icon: 'help', en: 'Support', uk: 'Допомога' },
  { id: 'settings', to: '/settings', icon: 'gear', en: 'Settings', uk: 'Налаштування' },
]

export function initialsOf(name: string | undefined) {
  return name?.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'F'
}

export function flentaId(id: string | undefined) {
  const digits = (id || '').replace(/[^0-9a-f]/gi, '').slice(-8).toUpperCase()
  return digits ? `${digits.slice(0, 4)} ${digits.slice(4)}` : ''
}

function LogoMark() {
  return <svg className={styles.logoMark} viewBox="0 0 14 22" aria-hidden="true"><path fill="#4f3cfb" d="M0 0h14v7H7v7H0Z"/><path fill="#4f3cfb" d="M0 16h2v6H0Z"/></svg>
}

interface WorkspaceLayoutProps {
  section: WorkspaceSection
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function WorkspaceLayout({ section, title, subtitle, actions, children }: WorkspaceLayoutProps) {
  const { user, logout } = useAuth()
  const { text: t } = useWorkspaceText()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('q') || '').trim()
    navigate(query ? `/support?${new URLSearchParams({ q: query })}` : '/support')
  }

  async function signOut() {
    setSigningOut(true); setSignOutError('')
    try { await logout() } catch { setSignOutError(t('Signed out locally. The server did not confirm sign-out.', 'Локальну сесію завершено. Сервер не підтвердив вихід.')) }
    finally { setSigningOut(false) }
  }

  return <div className={styles.workspace}>
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo} aria-label="Flenta"><LogoMark/>flenta</Link>
      <nav className={styles.nav} aria-label={t('Main navigation', 'Основна навігація')}>
        {sections.map(item => <Link key={item.id} to={item.to} className={styles.navItem} aria-current={item.id === section ? 'page' : undefined}>
          <Icon name={item.icon} size={24}/>{t(item.en, item.uk)}
        </Link>)}
      </nav>
      <div className={styles.sidebarFooter}>
        {user ? <button type="button" className={styles.signOut} disabled={signingOut} onClick={() => void signOut()}><Icon name="logout"/>{t('Sign out', 'Вийти')}</button>
          : <Link to="/auth/sign-in" className={styles.signOut}><Icon name="user"/>{t('Sign in', 'Увійти')}</Link>}
      </div>
    </aside>
    <div className={styles.main}>
      <header className={styles.topbar}>
        <form role="search" className={styles.search} onSubmit={search}>
          <Icon name="search" size={18}/>
          <label className={styles.srOnly} htmlFor="workspace-search">{t('Search help articles', 'Пошук у довідці')}</label>
          <input id="workspace-search" name="q" type="search" maxLength={100} placeholder={t('Search anything', 'Шукати будь-що')}/>
        </form>
        <div className={styles.account}>
          {user ? <Link to="/settings" className={styles.accountLink} aria-label={t('Open your settings', 'Відкрити налаштування')}>
            <span className={styles.identity}><strong>{user.displayName}</strong><small>FLENTA ID · {flentaId(user.id)}</small></span>
            <span className={styles.avatar}><span>{initialsOf(user.displayName)}</span></span>
          </Link> : <Link to="/auth/sign-in" className={styles.button}>{t('Sign in', 'Увійти')}</Link>}
          <Link to="/settings" className={styles.iconButton} aria-label={t('Settings', 'Налаштування')}><Icon name="settings" size={18}/></Link>
          <button type="button" className={styles.iconButton} disabled aria-label={t('Notifications — coming soon', 'Сповіщення — незабаром')} title={t('Coming soon', 'Незабаром')}><Icon name="bell" size={18}/></button>
        </div>
      </header>
      <main className={styles.page}>
        <div className={styles.pageInner}>
          {signOutError && <p role="alert" className={`${styles.feedback} ${styles.feedbackError}`}>{signOutError}</p>}
          {title && <div className={styles.pageHeader}>
            <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
            {actions && <div className={styles.pageActions}>{actions}</div>}
          </div>}
          {children}
        </div>
      </main>
    </div>
  </div>
}
