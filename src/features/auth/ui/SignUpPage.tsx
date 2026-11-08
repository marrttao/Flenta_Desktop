import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../localization/index'
import { useAuth } from '../providers/authContext'
import { AuthForm } from '../components/AuthForm.jsx'
import { AuthLayout } from './AuthLayout'
import { authCopy } from './authCopy'
import styles from './AuthLayout.module.css'

export function SignUpPage() {
  const { language } = useTranslation()
  const copy = authCopy[language]
  const { register } = useAuth()
  const navigate = useNavigate()

  return <AuthLayout title={copy.signUpTitle} description={copy.signUpDescription}
    footer={<p>{copy.hasAccount} <Link to="/auth/sign-in">{copy.signIn}</Link></p>}>
    <AuthForm submitLabel={copy.continue} successMessage={undefined} onSubmit={async (data: FormData) => {
      const firstName = String(data.get('firstName') ?? '').trim()
      const lastName = String(data.get('lastName') ?? '').trim()
      if (!firstName || !lastName) throw new Error(copy.nameRequired)
      const displayName = `${firstName} ${lastName}`.replace(/\s+/g, ' ')
      if (displayName.length > 100) throw new Error(copy.nameTooLong)
      const result = await register(String(data.get('email') ?? '').trim(),
        String(data.get('password') ?? ''), displayName)
      navigate(result.requiresEmailConfirmation ? '/auth/confirm-email' : '/kyc')
    }}>
      <div className={styles.fields}>
        <label className={styles.field} htmlFor="auth-first-name">
          <span>{copy.firstName}</span>
          <input id="auth-first-name" name="firstName" type="text" autoComplete="given-name"
            maxLength={100} required />
        </label>
        <label className={styles.field} htmlFor="auth-last-name">
          <span>{copy.lastName}</span>
          <input id="auth-last-name" name="lastName" type="text" autoComplete="family-name"
            maxLength={100} required />
        </label>
        <label className={styles.field} htmlFor="auth-email">
          <span>{copy.email}</span>
          <input id="auth-email" name="email" type="email" autoComplete="email"
            inputMode="email" maxLength={254} required />
        </label>
        <label className={styles.field} htmlFor="auth-password">
          <span>{copy.password}</span>
          <input id="auth-password" name="password" type="password" autoComplete="new-password"
            minLength={12} maxLength={128} aria-describedby="auth-password-help" required />
          <small id="auth-password-help">{copy.passwordHelp}</small>
        </label>
      </div>
    </AuthForm>
  </AuthLayout>
}
