import { Link } from 'react-router-dom'
import type { AuthUser } from '../../auth/types'
import { LANGUAGES, isSupportedLanguage } from '../../localization'
import type { WorkspaceText } from '../../workspace/model/useWorkspaceText'
import { flentaId, initialsOf } from '../../workspace/ui/WorkspaceLayout'
import { SoonBadge, StatusChip, ToggleRow } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Settings.module.css'

export const PROFILE_FORM_ID = 'settings-profile-form'

interface KycStatus { status?: string; canAccess?: boolean }

export function PersonalInfoPanel({ user, text: { text: t }, busy, onSave }: { user: AuthUser; text: WorkspaceText; busy: boolean; onSave: (displayName: string) => void }) {
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('Personal information', 'Особисті дані')}</h2></div>
    <div className={styles.identity}>
      <span className={styles.photo}>{initialsOf(user.displayName)}</span>
      <div className={styles.identityText}><strong>{user.displayName}</strong><small>FLENTA ID · {flentaId(user.id)}</small></div>
      <button type="button" className={ui.button} disabled>{t('Change photo', 'Змінити фото')}<SoonBadge/></button>
    </div>
    <form id={PROFILE_FORM_ID} onSubmit={event => { event.preventDefault(); onSave(String(new FormData(event.currentTarget).get('displayName') || '').trim()) }}>
      <fieldset className={`${ui.fieldGrid} ${styles.fields}`} disabled={busy}>
        <label className={ui.field}>{t('Full name', 'Ім’я та прізвище')}<input key={user.displayName} name="displayName" autoComplete="name" defaultValue={user.displayName} maxLength={100} required/></label>
        <label className={ui.field}>{t('Email address', 'Електронна пошта')}<input value={user.email || ''} readOnly aria-readonly="true"/>
          <small>{user.emailConfirmed ? t('Confirmed', 'Підтверджена') : t('Not confirmed yet', 'Ще не підтверджена')}</small></label>
        <label className={ui.field}><span>{t('Phone number', 'Номер телефону')}<SoonBadge/></span><input disabled placeholder="+380"/></label>
      </fieldset>
    </form>
  </section>
}

function kycChip(status: KycStatus | null, t: WorkspaceText['text']) {
  if (status?.canAccess) return <StatusChip tone="success">{t('Verified', 'Підтверджено')}</StatusChip>
  if (status && ['InProgress', 'PendingReview'].includes(status.status || '')) return <StatusChip tone="warning">{t('In review', 'На перевірці')}</StatusChip>
  return <StatusChip tone="danger">{t('Not verified', 'Не підтверджено')}</StatusChip>
}

export function SecurityPanel({ kyc, text: { text: t } }: { kyc: KycStatus | null; text: WorkspaceText }) {
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><div><h2>{t('Security', 'Безпека')}</h2><p>{t('Keep your account protected.', 'Захисти свій обліковий запис.')}</p></div></div>
    <div className={styles.securityRow}>
      <div><strong>{t('Password', 'Пароль')}</strong><small>{t('Use a unique password for Flenta', 'Використовуй унікальний пароль для Flenta')}</small></div>
      <Link className={ui.link} to="/auth/change-password">{t('Change', 'Змінити')}</Link>
    </div>
    <hr className={ui.divider}/>
    <ToggleRow soon checked={false} label={t('Two-factor authentication', 'Двофакторна автентифікація')} description={t('An extra layer of protection', 'Додатковий рівень захисту')}/>
    <hr className={ui.divider}/>
    <div className={styles.securityRow}>
      <div><strong>{t('Account verification', 'Підтвердження особи')}</strong><small>{kyc?.canAccess ? t('Your identity is verified', 'Твою особу підтверджено') : <Link className={ui.link} to="/kyc">{t('Complete verification', 'Пройти перевірку')}</Link>}</small></div>
      {kycChip(kyc, t)}
    </div>
  </section>
}

export function PreferencesPanel({ text: { text: t, language, setLanguage } }: { text: WorkspaceText }) {
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('Preferences', 'Уподобання')}</h2></div>
    <label className={styles.prefRow}><strong>{t('Language', 'Мова')}</strong>
      <select className={styles.prefSelect} value={language} onChange={e => { if (isSupportedLanguage(e.target.value)) setLanguage(e.target.value) }}>
        {LANGUAGES.map(item => <option key={item.reduction} value={item.reduction}>{item.nativeName}</option>)}
      </select>
    </label>
    <hr className={ui.divider}/>
    <div className={styles.prefRow}><strong>{t('Default currency', 'Основна валюта')}<SoonBadge/></strong><span className={ui.muted}>UAH · {t('Ukrainian hryvnia', 'Українська гривня')}</span></div>
    <hr className={ui.divider}/>
    <ToggleRow soon checked={false} label={t('Transaction notifications', 'Сповіщення про операції')} description={t('Stay up to date with your activity', 'Будь у курсі своїх операцій')}/>
  </section>
}

function describeDevice(agent: string, t: WorkspaceText['text']) {
  const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : t('Browser', 'Браузер')
  const system = /Windows/.test(agent) ? 'Windows' : /Mac OS X/.test(agent) ? 'macOS' : /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Linux/.test(agent) ? 'Linux' : ''
  return system ? `${browser} ${t('on', 'на')} ${system}` : browser
}

export function DevicesPanel({ text: { text: t }, signingOut, onSignOut }: { text: WorkspaceText; signingOut: boolean; onSignOut: () => void }) {
  return <section className={ui.panel}>
    <div className={ui.panelHeader}><h2>{t('Devices and sessions', 'Пристрої та сесії')}</h2></div>
    <div className={ui.row}>
      <span className={ui.rowIcon}><Icon name="device"/></span>
      <span className={ui.rowText}><strong>{describeDevice(navigator.userAgent, t)}</strong><small>{t('Current session', 'Поточна сесія')}</small></span>
    </div>
    <p className={styles.active}>●&nbsp; {t('Active now', 'Активна зараз')}</p>
    <button type="button" className={`${ui.button} ${ui.block}`} disabled>{t('Manage devices', 'Керувати пристроями')}<SoonBadge/></button>
    <button type="button" className={`${ui.buttonDanger} ${ui.block} ${styles.signOut}`} disabled={signingOut} onClick={onSignOut}><Icon name="logout" size={18}/>{t('Sign out', 'Вийти')}</button>
  </section>
}
