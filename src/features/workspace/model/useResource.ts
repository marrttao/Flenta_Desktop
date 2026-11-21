import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { bankingError } from '../../banking/utils/banking.js'

type Result<T> = { key: string; scope:string; status: 'loading' } | { key: string; scope:string; status: 'ready'; data: T } | { key: string; scope:string; status: 'error'; error: string }
export function useResource<T>(path: string, keepPreviousData = false) {
  const { user, request } = useAuth()
  const [revision, setRevision] = useState(0)
  const scope=(user?.id || 'guest') + ':' + path
  const key = scope + ':' + revision
  const [result, setResult] = useState<Result<T>>({ key: '', scope:'', status: 'loading' })
  const reload = useCallback(() => setRevision(n => n + 1), [])
  useEffect(() => {
    let active = true
    if (user) void request<T>(path).then(data => { if (active) setResult({ key, scope, status: 'ready', data }) })
      .catch(error => { if (active) setResult({ key, scope, status: 'error', error: bankingError(error) }) })
    return () => { active = false }
  }, [key, scope, path, request, user])
  const state: Result<T> = result.key === key || keepPreviousData && result.scope===scope && result.status==='ready' ? result : { key, scope, status: 'loading' }
  return { state, reload }
}
