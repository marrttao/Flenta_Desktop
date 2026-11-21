import { useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { bankingError } from '../../banking/utils/banking.js'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Notifications.module.css'
interface Notification { id: string; title: string; body: string; createdAt: string; isRead: boolean }
export function NotificationsPage() {
  const { request } = useAuth()
  const { text: t, locale } = useWorkspaceText()
  const { state, reload } = useResource<Notification[]>('/api/notifications')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <WorkspaceLayout section="notifications" title={t('Notifications', 'Сповіщення')} subtitle={t('Your latest account activity.', 'Останні події твого рахунку.')}>
    <Feedback error={error}/>
    {state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : state.status === 'error' ? <><Feedback error={state.error}/><button className={ui.button} onClick={reload}>{t('Retry', 'Повторити')}</button></> : <section className={styles.list}>
      {!state.data.length && <div className={ui.panel}>{t('You’re all caught up. New notifications will appear here.', 'Нових сповіщень немає. Вони з’являться тут.')}</div>}
      {state.data.map(note => <article key={note.id} className={note.isRead ? styles.read : styles.unread}><div><h2>{note.title}</h2><p>{note.body}</p><time>{new Date(note.createdAt).toLocaleString(locale)}</time></div>
        {!note.isRead && <button disabled={busy} className={ui.button} onClick={async () => { setBusy(true); setError(''); try { await request('/api/notifications/' + note.id + '/read', { method: 'POST' }); reload() } catch (e) { setError(bankingError(e)) } finally { setBusy(false) } }}>{t('Mark as read', 'Прочитано')}</button>}
      </article>)}
    </section>}
  </WorkspaceLayout>
}
