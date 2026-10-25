import { AuthForm } from '../components/AuthForm.jsx'
import { useAuth } from '../components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'
import { useNavigate } from '../../../app/routes/navigation.js'

export function SignInPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  return <section><h1>Вхід</h1>
    <AuthForm submitLabel="Увійти" onSubmit={async (data) => {
      await login(data.get('email'), data.get('password'))
      navigate('/profile')
    }}>
      <p><label htmlFor="email">Електронна пошта</label><br />
        <input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></p>
      <p><label htmlFor="password">Пароль</label><br />
        <input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required /></p>
    </AuthForm>
    <p><Link to="/auth/forgot-password">Забув пароль?</Link></p>
    <p><Link to="/auth/sign-up">Створити обліковий запис</Link></p>
  </section>
}
