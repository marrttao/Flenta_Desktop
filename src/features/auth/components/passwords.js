export function readPassword(data) {
  const password = data.get('password')
  if (password !== data.get('confirmPassword')) throw new Error('Паролі не збігаються.')
  return password
}
