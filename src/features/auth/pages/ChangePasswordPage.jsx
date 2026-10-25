import { AuthForm } from '../components/AuthForm.jsx'
import { PasswordFields } from '../components/PasswordFields.jsx'
import { readPassword } from '../components/passwords.js'
import { useAuth } from '../components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'

export function ChangePasswordPage() {
  const { request } = useAuth()
  return <section><h1>Зміна пароля</h1>
    <AuthForm submitLabel="Зберегти пароль" successMessage="Пароль змінено." onSubmit={async (data) => {
      await request('/api/auth/password', { method: 'PUT', body: { newPassword: readPassword(data) } })
    }}><PasswordFields /></AuthForm>
    <p><Link to="/profile">До профілю</Link></p>
  </section>
}
