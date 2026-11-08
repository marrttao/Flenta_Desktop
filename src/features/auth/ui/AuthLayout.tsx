import type { ReactNode } from 'react'
import hero from './assets/flenta-auth-hero.jpg'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return <section className={styles.layout} aria-labelledby="auth-heading">
    <aside className={styles.brand}>
      <img className={styles.hero} src={hero} width={928} height={1152}
        alt="Flenta. Your trusted financial partner." fetchPriority="high" />
    </aside>
    <div className={styles.content}>
      <header>
        <h1 className={styles.title} id="auth-heading">{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      <div className={styles.formArea}>{children}</div>
      <footer className={styles.footer}>{footer}</footer>
    </div>
  </section>
}
