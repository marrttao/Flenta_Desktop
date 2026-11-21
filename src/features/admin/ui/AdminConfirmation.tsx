import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { createAdminOperation } from '../api/adminOperations'
import { bankingError } from '../../banking/utils/banking.js'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import styles from './AdminWorkflow.module.css'
export function AdminConfirmation({ title, path, payload, onClose, onDone, children:details }: { title: string; path: string; payload: object; onClose: () => void; onDone: () => void; children?: ReactNode }) {
  const { request } = useAuth()
  const { text: t } = useWorkspaceText()
  const operation = useMemo(() => createAdminOperation(request), [request])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <Dialog title={title} onClose={() => { if (!busy) onClose() }}>
    <div className={styles.confirm}><p>{t('This action is linked to your administrator account and recorded in the audit log.', 'Дію буде пов’язано з твоїм обліковим записом адміністратора й записано до журналу.')}</p><div className={styles.confirmDetails}>{details}</div><Feedback error={error}/>
      <form onSubmit={async e => {
        e.preventDefault(); const data=new FormData(e.currentTarget); setBusy(true); setError('')
        try { await operation(path, { ...payload, reason: String(data.get('reason') || '').trim(), password: String(data.get('password') || '') }); onDone() }
        catch(failure) { setError(bankingError(failure)) } finally { setBusy(false) }
      }}><fieldset disabled={busy}><label>{t('Audit reason', 'Причина для журналу')}<textarea name="reason" minLength={5} maxLength={1000} required rows={3}/></label>
        <label>{t('Confirm your password', 'Підтвердь свій пароль')}<input name="password" type="password" autoComplete="current-password" required maxLength={128}/></label>
        <div className={styles.actions}><button type="button" onClick={onClose} disabled={busy}>{t('Cancel', 'Скасувати')}</button><button className={styles.primary} disabled={busy}>{busy ? t('Processing…', 'Обробка…') : t('Confirm action', 'Підтвердити дію')}</button></div>
      </fieldset></form>
    </div>
  </Dialog>
}
