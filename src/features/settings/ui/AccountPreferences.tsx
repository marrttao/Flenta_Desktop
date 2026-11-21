import { useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import { useResource } from '../../workspace/model/useResource'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Feedback, ToggleRow } from '../../workspace/ui/WorkspaceControls'
import { bankingError } from '../../banking/utils/banking.js'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Settings.module.css'
interface Settings { phone: string; defaultCurrency: string; transactionNotifications: boolean }
export function AccountPreferences() {
  const { state, reload } = useResource<Settings>('/api/settings')
  const { request } = useAuth()
  const { text: t } = useWorkspaceText()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)
  return <section className={ui.panel}><h2 className={styles.title}>{t('Account preferences', 'Налаштування рахунку')}</h2><Feedback error={error} notice={notice}/>
    {state.status === 'error' ? <><Feedback error={state.error}/><button className={ui.button} onClick={reload}>{t('Retry', 'Повторити')}</button></> : state.status === 'loading' ? <p role="status">{t('Loading…', 'Завантаження…')}</p> : <form key={state.key} onSubmit={async e => {
      e.preventDefault(); const data=new FormData(e.currentTarget); setBusy(true); setError(''); setNotice('')
      try { await request('/api/settings', { method: 'PUT', body: { phone: String(data.get('phone') || '').trim(), defaultCurrency: String(data.get('currency')), transactionNotifications: enabled ?? state.data.transactionNotifications } }); reload(); setEnabled(null); setNotice(t('Preferences saved.', 'Налаштування збережено.')) }
      catch (e) { setError(bankingError(e)) } finally { setBusy(false) }
    }}><fieldset className={styles.preferenceFields} disabled={busy}><label className={ui.field}>{t('Phone number', 'Номер телефону')}<input type="tel" name="phone" maxLength={16} placeholder="+380…" defaultValue={state.data.phone}/></label>
      <label className={ui.field}>{t('Default currency', 'Основна валюта')}<select name="currency" defaultValue={state.data.defaultCurrency}>{['UAH','USD','EUR'].map(c => <option key={c}>{c}</option>)}</select></label>
      <ToggleRow label={t('Transaction notifications', 'Сповіщення про операції')} checked={enabled ?? state.data.transactionNotifications} onChange={setEnabled}/>
      <button className={ui.buttonPrimary}>{busy ? t('Saving…', 'Зберігаємо…') : t('Save preferences', 'Зберегти налаштування')}</button>
    </fieldset></form>}
  </section>
}
