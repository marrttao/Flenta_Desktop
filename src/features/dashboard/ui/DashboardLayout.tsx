import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardModel } from '../model/useDashboard'
import styles from './Dashboard.module.css'

type IconName = 'home' | 'card' | 'transfer' | 'exchange' | 'help' | 'settings' | 'shield' | 'search' | 'plus' | 'arrow' | 'wallet' | 'statement' | 'savings' | 'close' | 'refresh' | 'logout' | 'purchase'
const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/></>,
  transfer: <><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></>,
  exchange: <><path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/></>,
  help: <><rect x="3" y="3" width="18" height="15" rx="3"/><path d="m7 18-2 4M7 8h10M7 12h7"/></>,
  settings: <><path d="m9 3 1-1h4l1 3 3 1 3 3-1 3 1 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 1-3-1-3 3-3Z"/><circle cx="12" cy="12" r="3"/></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/></>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
  plus: <path d="M12 4v16M4 12h16"/>, arrow: <path d="m9 5 7 7-7 7"/>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M17 10h4v5h-5v-5h1M7 5V3h11v2"/></>,
  statement: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h6"/></>,
  savings: <><path d="M5 8c-4 2-4 9 1 11v3h3v-2h7v2h3v-4l3-3v-4h-3l-2-5-4 2H8L5 5ZM9 12h4"/><circle cx="16" cy="12" r=".5"/></>,
  close: <path d="m5 5 14 14M5 19 19 5"/>,
  refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>,
  logout: <><path d="M9 4H3v16h6M9 12h12m-5-5 5 5-5 5"/></>,
  purchase: <><path d="M3 4h3l3 12h10l3-9H7M10 21h.01M18 21h.01"/></>,
}
export function Icon({ name }: { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => { const node = ref.current!; node.showModal(); return () => node.close() }, [])
  return <dialog className={styles.dialog} ref={ref} aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose() }}>
    <header><h2 id={id}>{title}</h2><button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close"><Icon name="close"/></button></header>
    {children}
  </dialog>
}

export function Feedback({ model: m }: { model: DashboardModel }) {
  return <div aria-live="polite">{m.error && <p role="alert" className={styles.error}>{m.error}</p>}{m.notice && <p role="status" className={styles.notice}>{m.notice}</p>}</div>
}

export function DashboardLayout({ model: m, children }: { model: DashboardModel; children: ReactNode }) {
  const t = m.text
  const initials = m.user?.displayName.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'F'
  return <div className={styles.dashboard}>
    <aside className={styles.sidebar} aria-label={t('Main navigation', 'Основна навігація')}>
      <Link to="/banking" className={styles.logo}><span aria-hidden="true">ϟ</span>flenta</Link>
      <nav>
        <a href="#dashboard-home" className={styles.navActive}><Icon name="home"/>{t('Home', 'Головна')}</a>
        <button type="button" onClick={() => m.setAction('cards')}><Icon name="card"/>{t('Cards', 'Картки')}</button>
        <button type="button" onClick={() => m.setAction('transfer')}><Icon name="transfer"/>{t('Transfers', 'Перекази')}</button>
        <Link to="/finance"><Icon name="exchange"/>{t('Currency exchange', 'Обмін валют')}</Link>
        <a href="#dashboard-savings"><Icon name="savings"/>{t('Savings', 'Накопичення')}</a>
        <button type="button" onClick={() => m.setAction('help')}><Icon name="help"/>{t('Support', 'Допомога')}</button>
        <Link to="/profile"><Icon name="settings"/>{t('Settings', 'Налаштування')}</Link>
      </nav>
      <div className={styles.sidebarBottom}>
        <Link to="/kyc" className={styles.security}><Icon name="shield"/><span>{t('Security & verification', 'Безпека та верифікація')}<small>{t('Manage your account security', 'Керуй безпекою облікового запису')}</small></span><Icon name="arrow"/></Link>
        {m.user ? <button type="button" className={styles.signOut} disabled={m.busy} onClick={async () => {
          try { await m.logout() } catch { m.setError(t('Signed out locally. The server did not confirm sign-out.', 'Локальну сесію завершено. Сервер не підтвердив вихід.')) }
        }}><Icon name="logout"/>{t('Sign out', 'Вийти')}</button> : <Link to="/auth/sign-in">{t('Sign in', 'Увійти')}</Link>}
      </div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <a href="#dashboard-history" className={styles.searchShortcut}><Icon name="search"/><span>{t('View your transactions', 'Переглянути операції')}</span></a>
        <Link to="/profile" className={styles.profile}><span className={styles.avatar}>{initials}</span><span>{m.user?.displayName || t('Welcome to Flenta', 'Вітаємо у Flenta')}<small>{m.user ? `FLENTA ID · ${m.user.id.slice(-8)}` : t('Your everyday banking', 'Твій щоденний банкінг')}</small></span></Link>
        <button className={styles.iconButton} type="button" disabled={m.disabled} onClick={() => void m.refresh()} aria-label={t('Refresh data', 'Оновити дані')}><Icon name="refresh"/></button>
      </header>
      <div id="dashboard-home" className={styles.page}>
        <h1 className={styles.srOnly}>{t('Your Flenta dashboard', 'Твій банк Flenta')}</h1>
        <div className={styles.sandbox}>{t('Sandbox · All balances, cards and transfers are virtual.', 'Пісочниця · Усі баланси, картки та перекази віртуальні.')}</div>
        {!m.user && <div className={styles.notice}><Link to="/auth/sign-in">{t('Sign in', 'Увійди')}</Link>{t(' or ', ' або ')}<Link to="/auth/sign-up">{t('create an account', 'зареєструйся')}</Link>{t(' to manage your cards and savings.', ', щоб керувати картками та накопиченнями.')}</div>}
        <div aria-live="polite">{m.error && <p className={styles.error} role="alert">{m.error}</p>}{m.notice && <p className={styles.notice} role="status">{m.notice}</p>}</div>
        {m.loading && <p className={styles.loading} role="status">{t('Updating your accounts…', 'Оновлюємо рахунки…')}</p>}
        {children}
      </div>
    </div>
  </div>
}
