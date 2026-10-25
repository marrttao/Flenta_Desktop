import { AuthForm } from '../components/AuthForm.jsx'
import { PasswordFields } from '../components/PasswordFields.jsx'
import { readPassword } from '../components/passwords.js'
import { useAuth } from '../components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'
import { useNavigate } from '../../../app/routes/navigation.js'

export function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  return <section><h1>Реєстрація</h1>
    <AuthForm submitLabel="Зареєструватися" onSubmit={async (data) => {
      const result = await register(data.get('email'), readPassword(data), data.get('displayName'))
      navigate(result.requiresEmailConfirmation ? '/auth/confirm-email' : '/profile')
    }}>
      <p><label htmlFor="displayName">Ім’я</label><br />
        <input id="displayName" name="displayName" autoComplete="name" maxLength={100} required /></p>
      <p><label htmlFor="email">Електронна пошта</label><br />
        <input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></p>
      <PasswordFields />
    </AuthForm>
    <p><Link to="/auth/sign-in">Вже є обліковий запис? Увійти</Link></p>
  </section>
}
