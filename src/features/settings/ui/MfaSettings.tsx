import { useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { bankingError } from '../../banking/utils/banking.js'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Settings.module.css'
interface Factor { id:string;name:string;status:string }
export function MfaSettings({embedded=false}:{embedded?:boolean}) {
  const { request,verifyMfa,refreshSession }=useAuth()
  const { text:t }=useWorkspaceText()
  const { state,reload }=useResource<Factor[]>('/api/auth/mfa')
  const [enrollment,setEnrollment]=useState<{id:string;secret:string}|null>(null)
  const [remove,setRemove]=useState<string|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  async function act(task:()=>Promise<void>){setBusy(true);setError('');try{await task();reload()}catch(e){setError(bankingError(e))}finally{setBusy(false)}}
  return <section className={embedded?styles.mfaEmbedded:ui.panel}><h2>{t('Two-factor authentication','Двофакторна автентифікація')}</h2><Feedback error={error}/>
    {state.status==='error'?<><Feedback error={state.error}/><button onClick={reload}>{t('Retry','Повторити')}</button></>:state.status==='loading'?<p role="status">{t('Loading…','Завантаження…')}</p>:<>
      {state.data.map(f=><div key={f.id}><p>{f.name || 'Flenta'} · {f.status}</p><button className={ui.buttonDanger} disabled={busy} onClick={()=>setRemove(f.id)}>{t('Remove authenticator','Видалити автентифікатор')}</button></div>)}
      <button className={ui.buttonPrimary} disabled={busy || state.data.length>=10} onClick={()=>void act(async()=>{setEnrollment(await request('/api/auth/mfa/enroll',{method:'POST'}))})}>{t('Add authenticator','Додати автентифікатор')}</button>
    </>}
    {enrollment && <Dialog title={t('Set up authenticator','Налаштувати автентифікатор')} onClose={()=>{if(!busy)setEnrollment(null)}}>
      <Feedback error={error}/><p>{t('Add a time-based account in your authenticator app using this secret. Keep it private.','Додай обліковий запис із часовим кодом у застосунку автентифікатора за цим секретом. Не передавай його іншим.')}</p>
      <code style={{overflowWrap:'anywhere'}}>{enrollment.secret}</code>
      <form onSubmit={e=>{e.preventDefault();const code=String(new FormData(e.currentTarget).get('code'));void act(async()=>{await verifyMfa(enrollment.id,code);setEnrollment(null)})}}>
        <fieldset disabled={busy}><label>{t('Six-digit code','Шестизначний код')}<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6}/></label><button className={ui.buttonPrimary}>{t('Verify and enable','Підтвердити й увімкнути')}</button></fieldset>
      </form>
    </Dialog>}
    {remove && <Dialog title={t('Remove authenticator?','Видалити автентифікатор?')} onClose={()=>{if(!busy)setRemove(null)}}>
      <Feedback error={error}/><p>{t('Removing your last authenticator turns off this extra sign-in protection.','Видалення останнього автентифікатора вимкне додаткову перевірку входу.')}</p>
      <button className={ui.buttonDanger} disabled={busy} onClick={()=>void act(async()=>{await request('/api/auth/mfa/'+remove,{method:'DELETE'});await refreshSession();setRemove(null)})}>{t('Remove authenticator','Видалити автентифікатор')}</button>
    </Dialog>}
  </section>
}
