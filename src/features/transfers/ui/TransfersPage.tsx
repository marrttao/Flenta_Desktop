import { useState } from 'react'
import { useDashboard, type TransferQuote } from '../../dashboard/model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { formatIban } from '../../banking/utils/transactionLabel'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Feedback, SoonBadge } from '../../workspace/ui/WorkspaceControls'
import { Dialog } from '../../workspace/ui/Dialog'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { accountLabel, NewTransferForm, type TransferDraft } from './NewTransferForm'
import { TransferSummary } from './TransferSummary'
import { RecentRecipients } from './RecentRecipients'
import styles from './Transfers.module.css'

interface ReviewedTransfer extends TransferQuote {
  byIban: boolean
  recipient: string
  body: { sourceAccountId: string; amount: number; destinationAccountId?: string; iban?: string }
}

const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function safeAmount(value: string) {
  try { return parseAmount(value) } catch { return null }
}

export function TransfersPage() {
  const m = useDashboard()
  const t = m.text
  const [draftState, setDraft] = useState<TransferDraft>({ mode: 'iban', source: '', destination: '', amount: '' })
  const [review, setReview] = useState<ReviewedTransfer | null>(null)
  const [confirming, setConfirming] = useState(false)
  const draft = { ...draftState, source: draftState.source || m.activeAccount?.id || '' }
  const account = m.accounts.find(a => a.id === draft.source)

  function change(next: TransferDraft) { setDraft(next); setReview(null) }

  async function quote() {
    setReview(null)
    await m.run(async () => {
      const amount = parseAmount(draft.amount)
      if (!account) throw new Error(t('Select an account to send from.', 'Обери рахунок списання.'))
      const byIban = draft.mode === 'iban'
      const iban = draft.destination.replace(/\s/g, '').toUpperCase()
      if (byIban && !/^UA\d{27}$/.test(iban)) throw new Error(t('Enter a Ukrainian IBAN: UA followed by 27 digits.', 'Введи український IBAN: UA та 27 цифр.'))
      if (!byIban && (!uuid.test(draft.destination) || draft.destination === account.id)) throw new Error(t('Choose a different account to receive the money.', 'Обери інший рахунок для зарахування.'))
      const destination = m.accounts.find(a => a.id === draft.destination)
      const preview = await m.bank.quote({ sourceAccountId: account.id, amount, byIban }) as TransferQuote
      setReview({
        ...preview, byIban,
        recipient: byIban ? formatIban(iban) : destination ? accountLabel(m, destination) : draft.destination,
        body: { sourceAccountId: account.id, amount, ...(byIban ? { iban } : { destinationAccountId: draft.destination }) },
      })
    }, '')
  }

  async function send() {
    if (!review) return
    const ok = await m.run(() => m.bank.transfer(review.byIban, review.body), t('Transfer completed.', 'Переказ виконано.'))
    setConfirming(false)
    if (ok) { setReview(null); setDraft({ ...draftState, destination: '', amount: '' }) }
  }

  return <WorkspaceLayout section="transfers" title={t('Transfers', 'Перекази')} subtitle={t('Send money simply, securely and on your terms.', 'Надсилай кошти просто, безпечно й на своїх умовах.')}
    actions={<button type="button" className={ui.button} disabled title={t('Coming soon', 'Незабаром')}>{t('Manage recipients', 'Керувати одержувачами')}<SoonBadge/></button>}>
    {!confirming && <Feedback error={m.error} notice={m.notice}/>}
    {m.loaded && !m.accounts.length && <p className={ui.notice}>{t('Open an account on the Home page to start sending money.', 'Відкрий рахунок на головній, щоб почати надсилати кошти.')}</p>}
    <div className={styles.grid}>
      <NewTransferForm model={m} draft={draft} onChange={change} onSubmit={() => void quote()}
        fee={review ? `${t('Transfer fee', 'Комісія')}: ${m.format(review.fee, review.currency)}` : ''}/>
      <div className={styles.side}>
        <TransferSummary model={m} amount={safeAmount(draft.amount)} currency={account?.currency || 'UAH'} quote={review} onConfirm={() => { m.clearFeedback(); setConfirming(true) }}/>
        <RecentRecipients model={m} onPick={iban => change({ ...draft, mode: 'iban', destination: formatIban(iban) })}/>
      </div>
    </div>
    {confirming && review && <Dialog title={t('Transaction confirmation', 'Підтвердження операції')} onClose={() => { if (!m.busy) setConfirming(false) }}>
      <div className={styles.warning}><Icon name="alert"/></div>
      <p className={styles.question}>{t('Do you really want to send', 'Ти дійсно хочеш надіслати')} <strong>{m.format(review.total, review.currency)}</strong> {t('to', 'на')} {review.recipient}?</p>
      <Feedback error={m.error}/>
      <div className={styles.dialogActions}>
        <button type="button" className={ui.button} disabled={m.busy} onClick={() => setConfirming(false)}>{t('Cancel', 'Скасувати')}</button>
        <button type="button" className={ui.buttonPrimary} disabled={m.disabled} onClick={() => void send()}>{m.busy ? t('Sending…', 'Надсилаємо…') : t('Confirm', 'Підтвердити')}</button>
      </div>
    </Dialog>}
  </WorkspaceLayout>
}
