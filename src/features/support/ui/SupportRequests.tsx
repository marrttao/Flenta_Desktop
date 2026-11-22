import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { bankingError } from '../../banking/utils/banking.js'
import type { SupportSummary, SupportConversation } from '../api/supportApi'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Support.module.css'

function Conversation({ id, staff, onClose, onUpdate }: { id: string; staff: boolean; onClose: () => void; onUpdate: () => void }) {
  const { request } = useAuth()
  const { text: t, locale } = useWorkspaceText()
  const base = staff ? '/api/admin/support' : '/api/support/requests'
  const { state, reload } = useResource<SupportConversation>(base + '/' + id, true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [draft,setDraft]=useState('')
  useEffect(()=>{ const timer=setInterval(()=>{if(document.visibilityState==='visible')reload()},15000);return()=>clearInterval(timer) },[reload])
  async function act(path: string, body?: unknown) {
    setBusy(true); setError('')
    try { await request(base + '/' + id + path, { method: 'POST', body }); reload(); onUpdate(); return true } catch (e) { setError(bankingError(e)); return false } finally { setBusy(false) }
  }
  return <Dialog title={state.status === 'ready' ? state.data.request.subject : t('Conversation', 'Розмова')} onClose={() => { if (!busy) onClose() }}>
    <Feedback error={error}/>
    {state.status === 'error' ? <><Feedback error={state.error}/><button onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : <>
      <div className={styles.messages} role="log" aria-label={t('Messages','Повідомлення')}>{state.data.messages.map(m => <article key={m.id} className={m.isStaff ? styles.staffMessage : styles.message}>
        <strong>{m.isStaff ? t('Flenta support', 'Підтримка Flenta') : t('Client', 'Клієнт')}</strong><p>{m.body}</p><small>{new Date(m.createdAt).toLocaleString(locale)}</small>
      </article>)}</div>
      {state.data.request.status === 'Open' ? <form onSubmit={e => { e.preventDefault(); void act('/messages', { body:draft }).then(ok => { if(ok) setDraft('') }) }}>
        <fieldset disabled={busy}><label>{t('Message', 'Повідомлення')}<textarea name="body" required maxLength={4000} rows={4} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button className={ui.buttonPrimary}>{t('Send message', 'Надіслати')}</button></fieldset>
        <button type="button" className={ui.button} disabled={busy} onClick={() => void act('/close')}>{t('Close request', 'Закрити звернення')}</button>
      </form> : <p role="status">{t('This request is closed.', 'Це звернення закрито.')}</p>}</>}
  </Dialog>
}

export function SupportRequests({ staff = false }: { staff?: boolean }) {
  const { user, request } = useAuth()
  const { text: t, locale } = useWorkspaceText()
  const { state, reload } = useResource<SupportSummary[]>(staff ? '/api/admin/support' : '/api/support/requests', true)
  const [creating, setCreating] = useState<'Message' | 'Callback' | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(()=>{ const timer=setInterval(()=>{if(document.visibilityState==='visible')reload()},30000);return()=>clearInterval(timer) },[reload])
  if (!user) return <section className={styles.contact}><h2>{t('Let’s talk', 'Поговорімо')}</h2><p><Link to="/auth/sign-in">{t('Sign in to contact support', 'Увійди, щоб написати підтримці')}</Link></p></section>
  return <>
    {!staff && <section className={styles.contact}><h2 className={styles.panelTitle}>{t('Let’s talk', 'Поговорімо')}</h2>
      <p className={styles.subtitle}>{t('Leave a message and our team will reply here.', 'Залиш повідомлення — команда відповість тут.')}</p>
      <button className={ui.buttonPrimary} onClick={() => { setError(''); setCreating('Message') }}>{t('Contact support', 'Написати підтримці')}</button>
      <button className={ui.button} onClick={() => { setError(''); setCreating('Callback') }}>{t('Request a call', 'Замовити дзвінок')}</button>
    </section>}
    <section className={styles.requests}><h2 className={styles.panelTitle}>{staff ? t('Support inbox', 'Звернення клієнтів') : t('Your requests', 'Твої звернення')}</h2>
      {state.status === 'error' ? <><Feedback error={state.error}/><button className={ui.button} onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : state.data.length ? <div className={styles.requestList}>{state.data.map(row => <button key={row.id} onClick={() => setSelected(row.id)}>
        <strong>{row.subject}</strong><small>{row.status} · {new Date(row.updatedAt).toLocaleDateString(locale)}</small>
      </button>)}</div> : <p>{t('No requests yet.', 'Звернень поки немає.')}</p>}
    </section>
    {creating && <Dialog title={creating === 'Callback' ? t('Request a call', 'Замовити дзвінок') : t('Contact support', 'Написати підтримці')} onClose={() => { if (!busy) setCreating(null) }}>
      <Feedback error={error}/>{creating === 'Callback' && <p>{t('Include your phone number and a suitable time. This sends a callback request to the team.', 'Вкажи телефон і зручний час. Команда отримає запит на дзвінок.')}</p>}
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget); setBusy(true); setError('')
        try { await request('/api/support/requests', { method: 'POST', body: { subject: String(data.get('subject')), body: String(data.get('body')), kind: creating } }); setCreating(null); reload() }
        catch (failure) { setError(bankingError(failure)) } finally { setBusy(false) }
      }}><fieldset disabled={busy}><label>{t('Subject', 'Тема')}<input name="subject" required maxLength={120}/></label><label>{t('Message', 'Повідомлення')}<textarea name="body" required maxLength={4000} rows={5}/></label>
        <button className={ui.buttonPrimary}>{busy ? t('Sending…', 'Надсилаємо…') : t('Send request', 'Надіслати звернення')}</button></fieldset></form>
    </Dialog>}
    {selected && <Conversation key={selected} id={selected} staff={staff} onClose={() => setSelected(null)} onUpdate={reload}/>}
  </>
}
