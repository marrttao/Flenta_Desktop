import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { bankingError } from '../../banking/utils/banking.js'
import { AuthLayout } from './AuthLayout'
import styles from './AuthLayout.module.css'
interface Factor { id:string;name:string;status:string }
export function MfaPage() {
  const { user,verifyMfa,logout }=useAuth()
  const { text:t }=useWorkspaceText()
  const { state,reload }=useResource<Factor[]>('/api/auth/mfa')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  if(!user) return <Navigate to="/auth/sign-in" replace/>
  const factors=state.status==='ready'?state.data.filter(f=>f.status==='verified'):[]
  return <AuthLayout footer={null} title={t('Confirm it’s you','Підтвердь, що це ти')} description={t('Enter the six-digit code from your authenticator app.','Введи шестизначний код із застосунку автентифікатора.')}>
    {error && <p role="alert">{error}</p>}
    {state.status==='error'?<><p role="alert">{state.error}</p><button onClick={reload}>{t('Retry','Повторити')}</button></>:state.status==='loading'?<p role="status">{t('Loading…','Завантаження…')}</p>:<form onSubmit={async e=>{
      e.preventDefault();const data=new FormData(e.currentTarget);setBusy(true);setError('')
      try{await verifyMfa(String(data.get('factor')),String(data.get('code')))}catch(failure){setError(bankingError(failure))}finally{setBusy(false)}
    }}><fieldset disabled={busy} className={styles.fields}><label className={styles.field}>{t('Authenticator','Автентифікатор')}<select name="factor" required>{factors.map(f=><option key={f.id} value={f.id}>{f.name || 'Flenta'}</option>)}</select></label>
      <label className={styles.field}>{t('Code','Код')}<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label>
      <button type="submit">{t('Continue','Продовжити')}</button></fieldset></form>}
    <button type="button" disabled={busy} onClick={()=>void logout()}>{t('Sign out','Вийти')}</button>
  </AuthLayout>
}
