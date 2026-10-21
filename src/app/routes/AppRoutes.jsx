import { useState } from 'react'
import { usePathname } from './navigation.js'
import { Link } from './Link.jsx'
import { useAuth } from '../../features/auth/components/authContext.js'
import { SignInPage } from '../../features/auth/pages/SignInPage.jsx'
import { SignUpPage } from '../../features/auth/pages/SignUpPage.jsx'
import { ConfirmEmailPage } from '../../features/auth/pages/ConfirmEmailPage.jsx'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx'
import { ChangePasswordPage } from '../../features/auth/pages/ChangePasswordPage.jsx'
import { ProfilePage } from '../../features/profile/pages/ProfilePage.jsx'

export function AppRoutes() {
  const path = usePathname()
  const { user, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const routes = {
    '/': <SignInPage />,
    '/auth/sign-in': <SignInPage />,
    '/auth/sign-up': <SignUpPage />,
    '/auth/confirm-email': <ConfirmEmailPage />,
    '/auth/forgot-password': <ForgotPasswordPage />,
    '/auth/reset-password': <ResetPasswordPage />,
    '/auth/change-password': user ? <ChangePasswordPage /> : <SignInPage />,
    '/profile': user ? <ProfilePage /> : <SignInPage />,
  }

  return <>
    <header><nav aria-label="Основна навігація">
      <Link to="/auth/sign-in">Вхід</Link>{' | '}
      <Link to="/auth/sign-up">Реєстрація</Link>{' | '}
      <Link to="/profile">Профіль</Link>
      {user && <button type="button" onClick={async () => {
        setLogoutError('')
        try { await logout() } catch { setLogoutError('Локальну сесію завершено, але сервер не підтвердив вихід. Спробуй увійти пізніше.') }
      }}>Вийти</button>}
    </nav></header>
    {logoutError && <p role="alert">{logoutError}</p>}
    <main key={path}>{routes[path] || <section><h1>Сторінку не знайдено</h1><Link to="/">На головну</Link></section>}</main>
  </>
}
