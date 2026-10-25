import { AuthForm } from '../components/AuthForm.jsx'
import { useAuth } from '../components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'

export function ForgotPasswordPage() {
  const { recover } = useAuth()
  return <section><h1>Відновлення доступу</h1>
    <AuthForm submitLabel="Надіслати посилання" successMessage="Якщо адреса зареєстрована, на неї надійде лист. Відкрий його в цьому браузері." onSubmit={(data) => recover(data.get('email'))}>
      <p><label htmlFor="email">Електронна пошта</label><br />
        <input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></p>
    </AuthForm>
    <p><Link to="/auth/sign-in">До входу</Link></p>
  </section>
}
