import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/components/authContext.js'
import { AuthForm } from '../../auth/components/AuthForm.jsx'
import { getProfile, updateProfile } from '../api/profileApi.js'
import { Link } from '../../../app/routes/Link.jsx'

export function ProfilePage() {
  const { user, request, updateUser } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getProfile(request).then((profile) => { if (active) updateUser(profile) })
      .catch((failure) => { if (active) setError(failure.message) })
    return () => { active = false }
  }, [request, updateUser])

  return <section><h1>Профіль</h1>
    {error && <p role="alert">{error}</p>}
    <dl><dt>Пошта</dt><dd>{user.email}</dd><dt>Підтверджена</dt><dd>{user.emailConfirmed ? 'Так' : 'Ні'}</dd></dl>
    <AuthForm submitLabel="Зберегти профіль" successMessage="Профіль збережено." onSubmit={async (data) => {
      updateUser(await updateProfile(request, data.get('displayName')))
    }}>
      <p><label htmlFor="displayName">Ім’я</label><br />
        <input key={user.displayName} id="displayName" name="displayName" autoComplete="name" defaultValue={user.displayName} maxLength={100} required /></p>
    </AuthForm>
    <p><Link to="/auth/change-password">Змінити пароль</Link></p>
  </section>
}
