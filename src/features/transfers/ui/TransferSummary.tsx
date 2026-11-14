import type { DashboardModel, TransferQuote } from '../../dashboard/model/useDashboard'
import ui from '../../workspace/ui/Workspace.module.css'
import styles from './Transfers.module.css'

interface Props { model: DashboardModel; amount: number | null; currency: string; quote: TransferQuote | null; onConfirm: () => void }

export function TransferSummary({ model: m, amount, currency, quote, onConfirm }: Props) {
  const t = m.text
  const sent = quote?.amount ?? amount
  return <section className={styles.summary} aria-live="polite">
    <h2 className={styles.panelTitle}>{t('Transfer summary', 'Підсумок переказу')}</h2>
    <p className={styles.youSend}>{t('You send', 'Ти надсилаєш')}</p>
    <p className={styles.sendAmount}>{sent !== null ? m.format(sent, quote?.currency || currency) : '—'}</p>
    <dl className={styles.terms}>
      <dt>{t('Fee', 'Комісія')}</dt><dd>{quote ? m.format(quote.fee, quote.currency) : '—'}</dd>
      <dt>{t('Arrival', 'Зарахування')}</dt><dd className={styles.instant}>{t('Usually instant', 'Зазвичай миттєво')}</dd>
      {quote && <><dt>{t('Total debit', 'До списання')}</dt><dd><strong>{m.format(quote.total, quote.currency)}</strong></dd></>}
    </dl>
    <p className={styles.note}>{t('Review all details before confirming.', 'Перевір усі деталі перед підтвердженням.')}</p>
    {quote && !quote.sufficientFunds && <p role="alert" className={`${ui.feedback} ${ui.feedbackError} ${styles.confirm}`}>{t('Insufficient funds including the fee.', 'Недостатньо коштів з урахуванням комісії.')}</p>}
    {quote && <button type="button" className={`${ui.buttonPrimary} ${ui.block} ${styles.confirm}`} disabled={m.disabled || !quote.sufficientFunds} onClick={onConfirm}>
      {t('Confirm transfer', 'Підтвердити переказ')} · {m.format(quote.total, quote.currency)}
    </button>}
  </section>
}
