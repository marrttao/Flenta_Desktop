import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { usePathname } from './navigation.js'
import { Link } from './Link.jsx'
import { useAuth } from '../../features/auth/components/authContext.js'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute.tsx'
import { SignInPage } from '../../features/auth/ui/SignInPage'
import { SignUpPage } from '../../features/auth/ui/SignUpPage'
import { ConfirmEmailPage } from '../../features/auth/pages/ConfirmEmailPage.jsx'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx'
import { ChangePasswordPage } from '../../features/auth/pages/ChangePasswordPage.jsx'
import { DashboardPage } from '../../features/dashboard/ui/DashboardPage'
import { CardsPage } from '../../features/cards/ui/CardsPage'
import { TransfersPage } from '../../features/transfers/ui/TransfersPage'
import { CurrencyExchangePage } from '../../features/currency/ui/CurrencyExchangePage'
import { SupportPage } from '../../features/support/ui/SupportPage'
import { SettingsPage } from '../../features/settings/ui/SettingsPage'
import { KycProvider } from '../../features/kyc/components/KycProvider.jsx'
import { useKyc } from '../../features/kyc/components/kycContext.js'
import { KycPage } from '../../features/kyc/pages/KycPage.jsx'

export function AppRoutes() {
  return <KycProvider><ApplicationRoutes /></KycProvider>
}

function ApplicationRoutes() {
  const path = usePathname()
  const { user, logout } = useAuth()
  const { status } = useKyc()
  const verified = status?.canAccess === true
  const [logoutError, setLogoutError] = useState('')
  const routes = {
    '/': <DashboardPage key={user?.id || 'guest'} />,
    '/banking': <Navigate to="/" replace />,
    '/cards': <ProtectedRoute><CardsPage key={user?.id} /></ProtectedRoute>,
    '/transfers': <ProtectedRoute><TransfersPage key={user?.id} /></ProtectedRoute>,
    '/exchange': <ProtectedRoute><CurrencyExchangePage key={user?.id} /></ProtectedRoute>,
    '/support': <SupportPage />,
    '/settings': <ProtectedRoute><SettingsPage key={user?.id} /></ProtectedRoute>,
    '/auth/sign-in': <SignInPage />,
    '/auth/sign-up': <SignUpPage />,
    '/auth/confirm-email': <ConfirmEmailPage />,
    '/auth/forgot-password': <ForgotPasswordPage />,
    '/auth/reset-password': <ResetPasswordPage />,
    '/auth/change-password': <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>,
    '/profile': <Navigate to="/settings" replace />,
    '/finance': <Navigate to="/exchange" replace />,
    '/kyc': <Navigate to="/settings" replace />,
  }

  const recovery = ['/auth/forgot-password', '/auth/reset-password', '/auth/confirm-email', '/support'].includes(path)
  const content = user && !verified && !recovery ? <KycPage key={user.id} /> : routes[path]

  return <>
    <header><nav aria-label="Основна навігація">
      <Link to="/">Home</Link>{' | '}
      <Link to="/test">Tests</Link>{' | '}
      <Link to="/" aria-current={path === '/' ? 'page' : undefined}>Мій банк</Link>{' | '}
      {user ? <Link to="/settings" aria-current={path === '/settings' ? 'page' : undefined}>Профіль</Link> : <>
        <Link to="/auth/sign-in" aria-current={path === '/auth/sign-in' ? 'page' : undefined}>Вхід</Link>{' | '}
        <Link to="/auth/sign-up" aria-current={path === '/auth/sign-up' ? 'page' : undefined}>Реєстрація</Link></>}
      {user && !verified && <>{' | '}<Link to="/kyc">Підтвердження особи</Link></>}
      {user && verified && <>{' | '}<Link to="/exchange" aria-current={path === '/exchange' ? 'page' : undefined}>Обмін валют</Link></>}
      {user && <>{' | '}<span>{user.displayName}</span>{' '}<button type="button" onClick={async () => {
        setLogoutError('')
        try { await logout() } catch { setLogoutError('Локальну сесію завершено, але сервер не підтвердив вихід.') }
      }}>Вийти</button></>}
    </nav></header>
    {logoutError && <p role="alert">{logoutError}</p>}
    <main key={path}>{content || <section><h1>Сторінку не знайдено</h1><Link to="/">На головну</Link></section>}</main>
  </>
}
