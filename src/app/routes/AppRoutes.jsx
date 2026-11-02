import { useState } from 'react'
import { usePathname } from './navigation.js'
import { Link } from './Link.jsx'
import { useAuth } from '../../features/auth/components/authContext.js'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute.tsx'
import { SignInPage } from '../../features/auth/pages/SignInPage.jsx'
import { SignUpPage } from '../../features/auth/pages/SignUpPage.jsx'
import { ConfirmEmailPage } from '../../features/auth/pages/ConfirmEmailPage.jsx'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx'
import { ChangePasswordPage } from '../../features/auth/pages/ChangePasswordPage.jsx'
import { ProfilePage } from '../../features/profile/pages/ProfilePage.jsx'
import { BankingPage } from '../../features/banking/pages/BankingPage.jsx'
import { FinancePage } from '../../features/finance/pages/FinancePage.jsx'
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
    '/': <BankingPage key={user?.id || 'guest'} />,
    '/banking': <BankingPage key={user?.id || 'guest'} />,
    '/auth/sign-in': <SignInPage />,
    '/auth/sign-up': <SignUpPage />,
    '/auth/confirm-email': <ConfirmEmailPage />,
    '/auth/forgot-password': <ForgotPasswordPage />,
    '/auth/reset-password': <ResetPasswordPage />,
    '/auth/change-password': <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>,
    '/profile': <ProtectedRoute><ProfilePage /></ProtectedRoute>,
    '/finance': <ProtectedRoute><FinancePage /></ProtectedRoute>,
    '/kyc': <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  }

  const recovery = ['/auth/forgot-password', '/auth/reset-password', '/auth/confirm-email'].includes(path)
  const content = user && !verified && !recovery ? <KycPage key={user.id} /> : routes[path]

  return <>
    <header><nav aria-label="Основна навігація">
      <Link to="/">Home</Link>{' | '}
      <Link to="/test">Tests</Link>{' | '}
      <Link to="/banking" aria-current={['/', '/banking'].includes(path) ? 'page' : undefined}>Мій банк</Link>{' | '}
      {user ? <Link to="/profile" aria-current={path === '/profile' ? 'page' : undefined}>Профіль</Link> : <>
        <Link to="/auth/sign-in" aria-current={path === '/auth/sign-in' ? 'page' : undefined}>Вхід</Link>{' | '}
        <Link to="/auth/sign-up" aria-current={path === '/auth/sign-up' ? 'page' : undefined}>Реєстрація</Link></>}
      {user && !verified && <>{' | '}<Link to="/kyc">Підтвердження особи</Link></>}
      {user && verified && <>{' | '}<Link to="/finance" aria-current={path === '/finance' ? 'page' : undefined}>Фінанси</Link></>}
      {user && <>{' | '}<span>{user.displayName}</span>{' '}<button type="button" onClick={async () => {
        setLogoutError('')
        try { await logout() } catch { setLogoutError('Локальну сесію завершено, але сервер не підтвердив вихід.') }
      }}>Вийти</button></>}
    </nav></header>
    {logoutError && <p role="alert">{logoutError}</p>}
    <main key={path}>{content || <section><h1>Сторінку не знайдено</h1><Link to="/">На головну</Link></section>}</main>
  </>
}
