import { useId, useState } from 'react'
import type { FaqEntry } from './supportCopy'
import styles from './Support.module.css'

type Text = (en: string, uk: string) => string

export function FaqAccordion({ entries, t }: { entries: FaqEntry[]; t: Text }) {
  const [open, setOpen] = useState<string | null>(entries[0]?.id ?? null)
  const id = useId()
  return <div className={styles.faq}>
    {entries.map(entry => {
      const expanded = open === entry.id
      return <div key={entry.id} className={styles.faqItem}>
        <button type="button" className={styles.faqQuestion} aria-expanded={expanded} aria-controls={`${id}-${entry.id}`} onClick={() => setOpen(expanded ? null : entry.id)}>
          <span>{t(...entry.question)}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        <p id={`${id}-${entry.id}`} className={styles.faqAnswer} hidden={!expanded}>{t(...entry.answer)}</p>
      </div>
    })}
  </div>
}
