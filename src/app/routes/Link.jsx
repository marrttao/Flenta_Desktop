import { navigate } from './navigation.js'

export function Link({ to, children, ...props }) {
  return <a {...props} href={to} onClick={(event) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      navigate(to)
    }
  }}>{children}</a>
}
