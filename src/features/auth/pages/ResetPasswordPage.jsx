import { ChangePasswordPage } from './ChangePasswordPage.jsx'
import { useEmailCallback } from '../components/useEmailCallback.js'
import { useAuth } from '../components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'

export function ResetPasswordPage() {
  const { user } = useAuth()
  const { pending, error } = useEmailCallback(true)
  return <section><h1>Новий пароль після відновлення</h1>
    {pending && <p role="status">Перевіряємо посилання…</p>}
    {error && <p role="alert">{error}</p>}
    {!pending && !error && (user ? <ChangePasswordPage /> : <p>Відкрий посилання з листа, щоб встановити новий пароль.</p>)}
    <p><Link to="/auth/forgot-password">Запросити нове посилання</Link></p>
  </section>
}
