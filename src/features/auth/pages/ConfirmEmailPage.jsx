import { useEmailCallback } from '../components/useEmailCallback.js'
import { Link } from '../../../app/routes/Link.jsx'

export function ConfirmEmailPage() {
  const { pending, error } = useEmailCallback()
  return <section><h1>Підтвердження пошти</h1>
    {pending ? <p role="status">Підтверджуємо пошту…</p> : <p>Перевір пошту та відкрий посилання в тому самому браузері. Якщо обліковий запис потребує підтвердження, лист надійде на вказану адресу.</p>}
    {error && <p role="alert">{error}</p>}
    <p><Link to="/auth/sign-in">До входу</Link></p>
  </section>
}
