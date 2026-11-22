import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Dialog.module.css'

export function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => { const node = ref.current!; node.showModal(); return () => node.close() }, [])
  return <dialog className={styles.dialog + (wide ? " " + styles.wide : "")} ref={ref} aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose() }}>
    <header><h2 id={id}>{title}</h2><button type="button" className={styles.close} onClick={onClose} aria-label="Close"><Icon name="close"/></button></header>
    {children}
  </dialog>
}
