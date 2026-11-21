import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../localization/index'
import { useAuth } from '../providers/authContext'
import { AuthForm } from '../components/AuthForm.jsx'
import { AuthLayout } from './AuthLayout'
import { authCopy } from './authCopy'
import styles from './AuthLayout.module.css'

export function SignInPage() {
  const { language } = useTranslation()
  const copy = authCopy[language]
  const { login } = useAuth()
  const navigate = useNavigate()
  const { search } = useLocation()

  return <AuthLayout title={copy.signInTitle} description={copy.signInDescription}
    footer={<p>{copy.noAccount} <Link to="/auth/sign-up">{copy.createAccount}</Link></p>}>
    <AuthForm submitLabel={copy.signIn} successMessage={undefined} onSubmit={async (data: FormData) => {
      await login(String(data.get('email') ?? '').trim(), String(data.get('password') ?? ''))
      const returnTo = new URLSearchParams(search).get('returnTo')
      navigate(returnTo === '/admin' || returnTo === '/admin/clients' ? returnTo : '/banking')
    }}>
      <div className={`${styles.fields} ${styles.singleColumn}`}>
        <label className={styles.field} htmlFor="auth-email">
          <span>{copy.email}</span>
          <input id="auth-email" name="email" type="email" autoComplete="username"
            inputMode="email" maxLength={254} required />
        </label>
        <label className={styles.field} htmlFor="auth-password">
          <span>{copy.password}</span>
          <input id="auth-password" name="password" type="password"
            autoComplete="current-password" maxLength={128} required />
        </label>
      </div>
      <p className={styles.recovery}><Link to="/auth/forgot-password">{copy.forgot}</Link></p>
    </AuthForm>
  </AuthLayout>
}
