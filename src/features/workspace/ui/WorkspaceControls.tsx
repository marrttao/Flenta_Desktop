import type { ReactNode } from 'react'
import { useWorkspaceText } from '../model/useWorkspaceText'
import styles from './Workspace.module.css'

export type ChipTone = 'default' | 'success' | 'warning' | 'danger'

const tones: Record<ChipTone, string> = {
  default: styles.chip, success: `${styles.chip} ${styles.chipSuccess}`,
  warning: `${styles.chip} ${styles.chipWarning}`, danger: `${styles.chip} ${styles.chipDanger}`,
}

export function StatusChip({ tone = 'default', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={tones[tone]}>{children}</span>
}

/** Marks a control from the design that has no backend support yet. */
export function SoonBadge() {
  const { text: t } = useWorkspaceText()
  return <span className={styles.soon}>{t('Soon', 'Незабаром')}</span>
}

interface ToggleProps { label: string; description?: string; checked: boolean; disabled?: boolean; soon?: boolean; onChange?: (value: boolean) => void }

export function ToggleRow({ label, description, checked, disabled, soon, onChange }: ToggleProps) {
  return <div className={styles.toggleRow}>
    <div><strong>{label}{soon && <SoonBadge/>}</strong>{description && <small>{description}</small>}</div>
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={styles.toggle} disabled={disabled || soon} onClick={() => onChange?.(!checked)}/>
  </div>
}

export function Feedback({ error, notice }: { error?: string; notice?: string }) {
  return <div aria-live="polite">
    {error && <p role="alert" className={`${styles.feedback} ${styles.feedbackError}`}>{error}</p>}
    {notice && <p role="status" className={styles.feedback}>{notice}</p>}
  </div>
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return <div className={styles.empty}><span className={styles.emptyIcon}>{icon}</span><strong>{title}</strong>{children && <p>{children}</p>}</div>
}
