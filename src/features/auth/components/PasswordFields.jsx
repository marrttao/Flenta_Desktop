export function PasswordFields() {
  return <>
    <p><label htmlFor="password">Новий пароль (12–128 символів)</label><br />
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></p>
    <p><label htmlFor="confirmPassword">Повтори пароль</label><br />
      <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></p>
  </>
}
