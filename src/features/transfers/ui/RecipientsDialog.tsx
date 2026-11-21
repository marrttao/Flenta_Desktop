import { useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { bankingError } from '../../banking/utils/banking.js'
import ui from '../../workspace/ui/Workspace.module.css'
interface Recipient { id: string; name: string; iban: string }
export function RecipientsDialog({ onClose, onPick }: { onClose: () => void; onPick: (iban: string) => void }) {
  const { request } = useAuth()
  const { text: t } = useWorkspaceText()
  const { state, reload } = useResource<Recipient[]>('/api/recipients')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <Dialog title={t('Saved recipients', 'Збережені одержувачі')} onClose={() => { if (!busy) onClose() }}>
    <Feedback error={error}/>
    {state.status === 'error' ? <><Feedback error={state.error}/><button onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : state.data.map(row => <div key={row.id} className={ui.panel}>
      <strong>{row.name}</strong><p style={{ overflowWrap: 'anywhere' }}>{row.iban}</p>
      <button className={ui.buttonPrimary} disabled={busy} onClick={() => onPick(row.iban)}>{t('Send money', 'Надіслати кошти')}</button>
      <button className={ui.buttonDanger} disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await request('/api/recipients/' + row.id, { method: 'DELETE' }); reload() } catch(e) { setError(bankingError(e)) } finally { setBusy(false) } }}>{t('Remove', 'Видалити')}</button>
    </div>)}
    <form onSubmit={async e => {
      e.preventDefault(); const form=e.currentTarget; const data=new FormData(form); setBusy(true); setError('')
      try { await request('/api/recipients', { method: 'POST', body: { name: String(data.get('name')), iban: String(data.get('iban')).replace(/\s/g,'').toUpperCase() } }); reload(); form.reset() }
      catch(e) { setError(bankingError(e)) } finally { setBusy(false) }
    }}><fieldset disabled={busy}><h3>{t('Add a recipient', 'Додати одержувача')}</h3><label>{t('Name', 'Ім’я')}<input name="name" required maxLength={100}/></label><label>IBAN<input name="iban" required maxLength={34}/></label><button className={ui.buttonPrimary}>{t('Save recipient', 'Зберегти одержувача')}</button></fieldset></form>
  </Dialog>
}
