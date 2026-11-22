import { useState } from 'react'
import { AdminConfirmation } from './AdminConfirmation'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import styles from './AdminWorkflow.module.css'
export function AdminNotificationsPage(){
  const {text:t}=useWorkspaceText()
  const [payload,setPayload]=useState<{ownerId:string|null;title:string;body:string}|null>(null)
  const [notice,setNotice]=useState('')
  return <section className={styles.panel}><h2>{t('Client notifications','Сповіщення клієнтам')}</h2>
    <p className={styles.muted}>{t('Messages appear in clients’ Flenta inboxes. External browser, email and SMS delivery are not enabled.','Повідомлення з’являються у Flenta клієнтів. Зовнішні push, email та SMS не надсилаються.')}</p>
    {notice && <p role="status">{notice}</p>}
    <form onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setNotice('');setPayload({ownerId:String(data.get('ownerId')||'').trim()||null,title:String(data.get('title')).trim(),body:String(data.get('body')).trim()})}}>
      <label className={styles.field}>{t('Client UUID (leave empty for all clients)','UUID клієнта (порожнє поле — всім клієнтам)')}<input name="ownerId" maxLength={36} pattern="[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}"/></label>
      <label className={styles.field}>{t('Title','Заголовок')}<input name="title" required maxLength={120}/></label>
      <label className={styles.field}>{t('Message','Повідомлення')}<textarea name="body" required maxLength={2000} rows={5}/></label>
      <button className={styles.primary}>{t('Review notification','Перевірити сповіщення')}</button>
    </form>
    {payload && <AdminConfirmation title={t('Confirm notification','Підтвердити сповіщення')} path="/api/admin/notifications" payload={payload} onClose={()=>setPayload(null)} onDone={()=>{setPayload(null);setNotice(t('Notification delivered to the selected inboxes.','Сповіщення додано до обраних скриньок.'))}}><p><strong>{payload.title}</strong></p><p>{payload.body}</p><p>{payload.ownerId || t('All clients (up to 5,000)','Усі клієнти (до 5 000)')}</p></AdminConfirmation>}
  </section>
}
