import { useRef,useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { bankingError } from '../../banking/utils/banking.js'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import { Dialog } from '../../workspace/ui/Dialog'
import styles from './Settings.module.css'
async function photoData(file:File) {
  if(file.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photo up to 5 MiB.')
  const bitmap=await createImageBitmap(file)
  try{
    const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height))
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale))
    const context=canvas.getContext('2d');if(!context)throw new Error('Photo processing is unavailable.')
    context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height)
    const encoded=canvas.toDataURL('image/jpeg',.8).split(',')[1]
    if(encoded.length>350000)throw new Error('Choose a smaller photo.')
    return encoded
  }finally{bitmap.close()}
}
export function AvatarEditor() {
  const {request}=useAuth(),{text:t}=useWorkspaceText()
  const input=useRef<HTMLInputElement>(null)
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
  async function upload(file:File) {
    setBusy(true);setError('')
    try{await request('/api/settings/avatar',{method:'PUT',body:{base64:await photoData(file)}});window.dispatchEvent(new Event('flenta-avatar-updated'));setOpen(false)}
    catch(e){setError(bankingError(e))}finally{setBusy(false)}
  }
  return <><button type="button" className={styles.smallButton} onClick={()=>{setError('');setOpen(true)}}>{t('Change photo','Змінити фото')}</button>
    {open && <Dialog title={t('Profile photo','Фото профілю')} onClose={()=>{if(!busy)setOpen(false)}}>
      <Feedback error={error}/><p>{t('Choose a photo up to 5 MiB. It will be resized and saved privately with your profile.','Обери фото до 5 MiB. Його буде зменшено й збережено приватно у твоєму профілі.')}</p>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/>
      <button disabled={busy} onClick={()=>input.current?.click()}>{t('Choose photo','Обрати фото')}</button>
      <button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await request('/api/settings/avatar',{method:'PUT',body:{base64:null}});window.dispatchEvent(new Event('flenta-avatar-updated'));setOpen(false)}catch(e){setError(bankingError(e))}finally{setBusy(false)}}}>{t('Remove photo','Прибрати фото')}</button>
    </Dialog>}</>
}
