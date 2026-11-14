import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/providers/authContext'
import type { AuthUser } from '../../auth/types'
import { getProfile, updateProfile } from '../../profile/api/profileApi.js'
import { useKyc } from '../../kyc/components/kycContext.js'
import { bankingError } from '../../banking/utils/banking.js'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import ui from '../../workspace/ui/Workspace.module.css'
import { DevicesPanel, PersonalInfoPanel, PreferencesPanel, PROFILE_FORM_ID, SecurityPanel } from './SettingsPanels'
import styles from './Settings.module.css'

export function SettingsPage() {
  const { user, request, updateUser, logout } = useAuth()
  const { status } = useKyc()
  const text = useWorkspaceText()
  const t = text.text
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    getProfile(request).then((profile: unknown) => { if (active) updateUser(profile as AuthUser) })
      .catch((failure: unknown) => { if (active) setError(bankingError(failure)) })
    return () => { active = false }
  }, [request, updateUser])

  async function save(displayName: string) {
    if (!displayName) return
    setBusy(true); setError(''); setNotice('')
    try { updateUser(await updateProfile(request, displayName) as AuthUser); setNotice(t('Changes saved.', 'Зміни збережено.')) }
    catch (failure) { setError(bankingError(failure)) }
    finally { setBusy(false) }
  }

  async function signOut() {
    setSigningOut(true); setError('')
    try { await logout() } catch { setError(t('Signed out locally. The server did not confirm sign-out.', 'Локальну сесію завершено. Сервер не підтвердив вихід.')) }
    finally { setSigningOut(false) }
  }

  if (!user) return null
  return <WorkspaceLayout section="settings" title={t('Settings', 'Налаштування')} subtitle={t('Make Flenta feel like you.', 'Зроби Flenta зручною для себе.')}
    actions={<button type="submit" form={PROFILE_FORM_ID} className={`${ui.button} ${styles.save}`} disabled={busy}>{busy ? t('Saving…', 'Зберігаємо…') : t('Save changes', 'Зберегти зміни')}</button>}>
    <Feedback error={error} notice={notice}/>
    <div className={styles.grid}>
      <PersonalInfoPanel user={user} text={text} busy={busy} onSave={name => void save(name)}/>
      <SecurityPanel kyc={status} text={text}/>
    </div>
    <div className={styles.grid}>
      <PreferencesPanel text={text}/>
      <DevicesPanel text={text} signingOut={signingOut} onSignOut={() => void signOut()}/>
    </div>
  </WorkspaceLayout>
}
