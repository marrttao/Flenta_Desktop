import { Link } from 'react-router-dom'
import type { AuthUser } from '../../auth/types'
import { LANGUAGES, isSupportedLanguage } from '../../localization'
import type { WorkspaceText } from '../../workspace/model/useWorkspaceText'
import { flentaId, initialsOf } from '../../workspace/ui/WorkspaceLayout'
import { SoonBadge } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import styles from './Settings.module.css'

export const PROFILE_FORM_ID = 'settings-profile-form'

interface KycStatus { status?: string; canAccess?: boolean }

/** The backend stores one display name; the design edits it as first and last name. */
export function splitName(displayName: string) {
  const [first = '', ...rest] = displayName.trim().split(/\s+/)
  return { first, last: rest.join(' ') }
}

function StaticToggle({ label }: { label: string }) {
  return <span className={styles.toggle} role="switch" aria-checked="false" aria-disabled="true" aria-label={label}/>
}

export function PersonalInfoPanel({ user, text: { text: t }, busy, onSave }: { user: AuthUser; text: WorkspaceText; busy: boolean; onSave: (displayName: string) => void }) {
  const name = splitName(user.displayName)
  return <section className={styles.personal}>
    <h2 className={styles.title}>{t('Personal information', 'Особисті дані')}</h2>
    <div className={styles.identity}>
      <span className={styles.photo}>{initialsOf(user.displayName)}</span>
      <div className={styles.identityText}><strong>{user.displayName}</strong><small>FLENTA ID · {flentaId(user.id)}</small></div>
      <button type="button" className={styles.smallButton} disabled title={t('Coming soon', 'Незабаром')}>{t('Change photo', 'Змінити фото')}</button>
    </div>
    <form id={PROFILE_FORM_ID} key={user.displayName} onSubmit={event => {
      event.preventDefault(); const data = new FormData(event.currentTarget)
      onSave(`${String(data.get('firstName') || '').trim()} ${String(data.get('lastName') || '').trim()}`.trim())
    }}>
      <fieldset className={styles.fields} disabled={busy}>
        <label className={styles.field}>{t('First name', 'Ім’я')}<input name="firstName" autoComplete="given-name" defaultValue={name.first} maxLength={60} required/></label>
        <label className={styles.field}>{t('Last name', 'Прізвище')}<input name="lastName" autoComplete="family-name" defaultValue={name.last} maxLength={60}/></label>
        <label className={styles.field}>{t('Email address', 'Електронна пошта')}<input value={user.email || ''} readOnly aria-readonly="true"/></label>
        <label className={styles.field}><span>{t('Phone number', 'Номер телефону')}<SoonBadge/></span><input disabled placeholder="+380"/></label>
      </fieldset>
    </form>
  </section>
}

function kycChip(status: KycStatus | null, t: WorkspaceText['text']) {
  if (status?.canAccess) return <span className={`${styles.chip} ${styles.chipVerified}`}>{t('Verified', 'Підтверджено')}</span>
  if (status && ['InProgress', 'PendingReview'].includes(status.status || '')) return <span className={`${styles.chip} ${styles.chipReview}`}>{t('In review', 'На перевірці')}</span>
  return <span className={`${styles.chip} ${styles.chipMissing}`}>{t('Not verified', 'Не підтверджено')}</span>
}

export function SecurityPanel({ kyc, text: { text: t } }: { kyc: KycStatus | null; text: WorkspaceText }) {
  return <section className={styles.security}>
    <h2 className={styles.title}>{t('Security', 'Безпека')}</h2>
    <p className={styles.subtitle}>{t('Keep your account protected.', 'Захисти свій обліковий запис.')}</p>
    <div className={`${styles.securityRow} ${styles.passwordRow}`}>
      <div><strong className={styles.strong14}>{t('Password', 'Пароль')}</strong><small>{t('Use a unique password for Flenta', 'Використовуй унікальний пароль для Flenta')}</small></div>
      <Link className={styles.change} to="/auth/change-password">{t('Change', 'Змінити')}</Link>
    </div>
    <div className={`${styles.securityRow} ${styles.twoFactorRow}`}>
      <div><strong className={styles.strong13}>{t('Two-factor authentication', 'Двофакторна автентифікація')}<SoonBadge/></strong><small>{t('An extra layer of protection', 'Додатковий рівень захисту')}</small></div>
      <StaticToggle label={t('Two-factor authentication', 'Двофакторна автентифікація')}/>
    </div>
    <div className={`${styles.securityRow} ${styles.verificationRow}`}>
      <div><strong className={styles.strong14}>{t('Account verification', 'Підтвердження особи')}</strong><small>{kyc?.canAccess ? t('Your identity is verified', 'Твою особу підтверджено') : <Link className={styles.inlineLink} to="/kyc">{t('Complete verification', 'Пройти перевірку')}</Link>}</small></div>
      {kycChip(kyc, t)}
    </div>
  </section>
}

export function PreferencesPanel({ text: { text: t, language, setLanguage } }: { text: WorkspaceText }) {
  const current = LANGUAGES.find(item => item.reduction === language)
  return <section className={styles.preferences}>
    <h2 className={styles.title}>{t('Preferences', 'Уподобання')}</h2>
    <label className={`${styles.prefRow} ${styles.languageRow}`}>
      <strong>{t('Language', 'Мова')}</strong>
      <span className={styles.prefValue}>{current?.nativeName}<Icon name="arrow" size={18}/></span>
      <select className={styles.overlaySelect} aria-label={t('Language', 'Мова')} value={language} onChange={e => { if (isSupportedLanguage(e.target.value)) setLanguage(e.target.value) }}>
        {LANGUAGES.map(item => <option key={item.reduction} value={item.reduction}>{item.nativeName}</option>)}
      </select>
    </label>
    <div className={`${styles.prefRow} ${styles.currencyRow}`}>
      <strong>{t('Default currency', 'Основна валюта')}<SoonBadge/></strong>
      <span className={`${styles.prefValue} ${styles.prefValueSmall}`}>UAH · {t('Ukrainian hryvnia', 'Українська гривня')}<Icon name="arrow" size={18}/></span>
    </div>
    <div className={`${styles.prefRow} ${styles.notificationsRow}`}>
      <div><strong>{t('Transaction notifications', 'Сповіщення про операції')}<SoonBadge/></strong><small>{t('Stay up to date with your activity', 'Будь у курсі своїх операцій')}</small></div>
      <StaticToggle label={t('Transaction notifications', 'Сповіщення про операції')}/>
    </div>
  </section>
}

function describeDevice(agent: string, t: WorkspaceText['text']) {
  const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Firefox\//.test(agent) ? 'Firefox' : /Chrome\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : t('Browser', 'Браузер')
  const system = /Windows/.test(agent) ? 'Windows' : /Mac OS X/.test(agent) ? 'macOS' : /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Linux/.test(agent) ? 'Linux' : ''
  return system ? `${browser} ${t('on', 'на')} ${system}` : browser
}

export function DevicesPanel({ text: { text: t }, signingOut, onSignOut }: { text: WorkspaceText; signingOut: boolean; onSignOut: () => void }) {
  return <section className={styles.devices}>
    <h2 className={styles.title20}>{t('Devices and sessions', 'Пристрої та сесії')}</h2>
    <div className={styles.session}>
      <span className={styles.sessionIcon}><Icon name="settings" size={20}/></span>
      <span><strong>{describeDevice(navigator.userAgent, t)}</strong><small>{t('Current session', 'Поточна сесія')}</small></span>
    </div>
    <p className={styles.active}>●  {t('Active now', 'Активна зараз')}</p>
    <button type="button" className={styles.wideButton} disabled title={t('Coming soon', 'Незабаром')}>{t('Manage devices', 'Керувати пристроями')}</button>
    <button type="button" className={`${styles.wideButton} ${styles.signOut}`} disabled={signingOut} onClick={onSignOut}>{t('Sign out', 'Вийти')}</button>
  </section>
}
