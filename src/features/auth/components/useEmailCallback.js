import { useEffect, useRef, useState } from 'react'
import { useAuth } from './authContext.js'
import { useNavigate } from '../../../app/routes/navigation.js'

export function useEmailCallback(isRecovery = false) {
  const navigate = useNavigate()
  const { exchangeCode } = useAuth()
  const started = useRef(false)
  const [pending, setPending] = useState(() => new URLSearchParams(window.location.search).has('code'))
  const [error, setError] = useState(() => new URLSearchParams(window.location.search).has('error') ? 'Посилання недійсне або термін його дії минув. Запроси новий лист.' : '')

  useEffect(() => {
    if (started.current) return
    started.current = true
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (params.size || window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname)
    if (!code) return
    exchangeCode(code)
      .then(() => { if (!isRecovery) navigate('/profile') })
      .catch((failure) => setError(failure.message))
      .finally(() => setPending(false))
  }, [exchangeCode, isRecovery, navigate])

  return { pending, error }
}
