import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import type { IdentityData } from '../../profile/model/identity'
import ui from '../../workspace/ui/Workspace.module.css'
export function VerifiedIdentityPanel(){
  const {state,reload}=useResource<IdentityData|null>('/api/profile/identity'),{text:t}=useWorkspaceText()
  return <section className={ui.panel}><h2>{t('Identity from documents','Дані з документів')}</h2>
    {state.status==='error'?<><Feedback error={state.error}/><button onClick={reload}>{t('Retry','Повторити')}</button></>:state.status==='loading'?<p role="status">{t('Loading…','Завантаження…')}</p>:state.data?<dl>
      <dt>{t('Legal name','Ім’я за документом')}</dt><dd>{state.data.fullName}</dd><dt>{t('Date of birth','Дата народження')}</dt><dd>{state.data.dateOfBirth||'—'}</dd><dt>{t('Country','Країна')}</dt><dd>{state.data.country}</dd><dt>{t('Tax ID (RNOKPP)','РНОКПП')}</dt><dd>{state.data.taxNumber||'—'}</dd>
    </dl>:<p>{t('Identity details will appear after document processing. Older verifications may need a status refresh.','Дані з’являться після обробки документа. Для старих перевірок може знадобитися оновлення статусу.')}</p>}
    <p className={ui.muted}>{t('To correct these details, contact support for a new verification. Your display name does not change your document identity.','Для виправлення даних звернися до підтримки щодо повторної перевірки. Відображуване ім’я не змінює дані документа.')}</p>
  </section>
}
