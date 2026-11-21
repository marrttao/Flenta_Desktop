import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import type { KycItem, IdentityData } from '../model/workflowTypes'
import styles from './AdminWorkflow.module.css'
interface Evidence { verificationId:string; ownerId:string; providerSessionId:string|null; identity:IdentityData|null; documents:{frontImage:string|null;backImage:string|null}|null }
export function AdminKycReview({item,onClose,onDecision}:{item:KycItem;onClose:()=>void;onDecision:(approved:boolean)=>void}){
  const {text:t}=useWorkspaceText()
  const {state,reload}=useResource<Evidence>('/api/admin/kyc/'+item.id+'/evidence')
  return <Dialog wide title={t('Review KYC application','Перевірка заявки KYC')} onClose={onClose}>
    {state.status==='error'?<><Feedback error={state.error}/><button onClick={reload}>{t('Retry','Повторити')}</button></>:state.status==='loading'?<p role="status">{t('Loading identity evidence…','Завантажуємо дані перевірки…')}</p>:<div className={styles.evidence}>
      <div className={styles.documents}>{(['frontImage','backImage'] as const).map((side,index)=><figure key={side}><figcaption>{index===0?t('Front side · ID card','Лицьовий бік · документ'):t('Back side · ID card','Зворотний бік · документ')}</figcaption>
        {state.data.documents?.[side]?<img src={state.data.documents[side]!} alt={index===0?t('Front of identity document','Лицьовий бік документа'):t('Back of identity document','Зворотний бік документа')} referrerPolicy="no-referrer"/>:<p>{t('This image is not returned by the provider.','Провайдер не повернув це зображення.')}</p>}
      </figure>)}<small>{t('Temporary provider links. Images are not stored locally.','Тимчасові посилання провайдера. Зображення локально не зберігаються.')}</small></div>
      <div><h3>{state.data.identity?.fullName || item.displayName}</h3><p className={styles.muted}>{item.email} · {item.provider} · #{item.attempt}</p>
        {state.data.identity?<dl className={styles.details}><dt>{t('Date of birth','Дата народження')}</dt><dd>{state.data.identity.dateOfBirth || '—'}</dd><dt>{t('Country','Країна')}</dt><dd>{state.data.identity.country}</dd><dt>{t('Tax ID (RNOKPP)','РНОКПП')}</dt><dd>{state.data.identity.taxNumber || t('Not extracted','Не розпізнано')}</dd><dt>{t('Document number','Номер документа')}</dt><dd>{state.data.identity.documentNumber || '—'}</dd></dl>:<p>{t('The provider has no approved extracted identity. Ask the client to resubmit.','Провайдер не має підтверджених даних особи. Потрібне повторне подання.')}</p>}
        <div className={styles.actions}><button className={styles.approve} disabled={!state.data.identity || !state.data.documents?.frontImage} onClick={()=>onDecision(true)}>{t('Approve KYC','Схвалити KYC')}</button><button className={styles.danger} onClick={()=>onDecision(false)}>{t('Reject KYC','Відхилити KYC')}</button></div>
        <p className={styles.muted}>{t('The decision and reason are recorded with your administrator ID. A failed mandatory check requires resubmission.','Рішення та причина записуються разом з ID адміністратора. Непройдені обов’язкові перевірки потребують повторного подання.')}</p>
      </div>
    </div>}
  </Dialog>
}
