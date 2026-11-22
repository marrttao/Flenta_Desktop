import { Link } from 'react-router-dom'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { Icon } from '../../workspace/ui/Icon'
import styles from './Admin.module.css'

export function AdminState({ kind, search, retry }: { kind: 'error' | 'empty' | 'forbidden'; search?: boolean; retry?: () => void }) {
  const { text: t } = useWorkspaceText()
  const title = kind === 'forbidden' ? t('Administrator access required', 'Потрібні права адміністратора')
    : kind === 'error' ? t('Something went wrong', 'Щось пішло не так')
    : search ? t('No clients found', 'Клієнтів не знайдено') : t('No data yet', 'Даних поки немає')
  const description = kind === 'forbidden' ? t('This account does not have permission to view this page.', 'Цей обліковий запис не має доступу до сторінки.')
    : kind === 'error' ? t('We could not load the information. Please try again.', 'Не вдалося завантажити інформацію. Спробуй ще раз.')
    : search ? t('Try another email address or clear your search.', 'Спробуй іншу адресу або очисть пошук.')
    : t('Information will appear here when it is available.', 'Інформація з’явиться тут, коли стане доступною.')
  return <div className={styles.state} role={kind === 'error' || kind === 'forbidden' ? 'alert' : 'status'}>
    <span className={kind === 'error' ? styles.errorIcon : styles.stateIcon}><Icon name={kind === 'forbidden' ? 'lock' : kind === 'error' ? 'alert' : 'search'} size={28}/></span>
    <h2>{title}</h2><p>{description}</p>
    {retry && <button type="button" className={styles.primaryButton} onClick={retry}>{search ? t('Clear search', 'Очистити пошук') : t('Try again', 'Спробувати ще раз')}</button>}
    {kind === 'forbidden' && <Link className={styles.primaryButton} to="/">{t('Back to Flenta', 'Повернутися до Flenta')}</Link>}
  </div>
}

const states: Record<string, { en: string; uk: string; tone: string }> = {
  Verified: { en: 'Verified', uk: 'Підтверджено', tone: 'success' },
  Completed: { en: 'Completed', uk: 'Завершено', tone: 'success' },
  Pending: { en: 'Pending', uk: 'Очікує', tone: 'pending' },
  PendingReview: { en: 'In review', uk: 'На перевірці', tone: 'pending' },
  InProgress: { en: 'In progress', uk: 'У процесі', tone: 'pending' },
  NeedsResubmission: { en: 'Resubmission needed', uk: 'Потрібно повторити', tone: 'pending' },
  Rejected: { en: 'Failed', uk: 'Відхилено', tone: 'danger' },
  VerificationRejected: { en: 'Rejected', uk: 'Відхилено', tone: 'danger' },
  Expired: { en: 'Expired', uk: 'Термін минув', tone: 'muted' },
  NotStarted: { en: 'Not started', uk: 'Не розпочато', tone: 'muted' },
  NotVerified: { en: 'Not verified', uk: 'Не підтверджено', tone: 'muted' },
}
export function AdminBadge({ status }: { status: string }) {
  const { text: t } = useWorkspaceText()
  const state = states[status] ?? { en: 'Unknown', uk: 'Невідомо', tone: 'muted' }
  return <span className={styles.badge} data-tone={state.tone}>{t(state.en, state.uk)}</span>
}

export function SkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return <>{Array.from({ length: rows }, (_, row) => <tr key={row} aria-hidden="true">{Array.from({ length: columns }, (_, column) =>
    <td key={column}><span className={styles.skeleton}/></td>)}</tr>)}</>
}
