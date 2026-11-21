import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import type { AdminLoad } from './types'

export function useAdminLoad<T>(key: string, load: () => Promise<T>) {
  const { user } = useAuth()
  const { text: t } = useWorkspaceText()
  const [revision, setRevision] = useState(0)
  const ownerKey = user?.id + ':' + key + ':' + revision
  const [result, setResult] = useState<AdminLoad<T>>({ key: '', status: 'loading' })
  const reload = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    let active = true
    void load().then(data => {
      if (active) setResult({ key: ownerKey, status: 'ready', data })
    }).catch((failure: unknown) => {
      if (!active) return
      const forbidden = typeof failure === 'object' && failure !== null && 'status' in failure && failure.status === 403
      setResult({ key: ownerKey, status: 'error', forbidden,
        error: forbidden ? t('Administrator access is required.', 'Потрібні права адміністратора.')
          : t('We could not load the information. Please try again.', 'Не вдалося завантажити інформацію. Спробуй ще раз.') })
    })
    return () => { active = false }
  }, [load, ownerKey, revision, t])
  const state: AdminLoad<T> = result.key === ownerKey ? result : { key: ownerKey, status: 'loading' }
  return { state, reload }
}
