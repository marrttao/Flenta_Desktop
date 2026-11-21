import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDashboard } from '../../dashboard/model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from '../../workspace/ui/WorkspaceControls'
import ui from '../../workspace/ui/Workspace.module.css'
export function PaymentsPage() {
  const m=useDashboard(), t=m.text
  const [params]=useSearchParams()
  const [kind, setKind]=useState(params.get('kind') === 'loan' ? 'LoanRepayment' : 'MobileTopUp')
  const [review, setReview]=useState<{ accountId:string;amount:number;kind:string;reference:string } | null>(null)
  return <WorkspaceLayout section="transfers" title={t('Payments', 'Платежі')} subtitle={t('Sandbox payments with virtual funds.', 'Тестові платежі віртуальними коштами.')}>
    <Feedback error={m.error} notice={m.notice}/><section className={ui.panel} style={{maxWidth:720}}>
      <p className={ui.notice}>{t('Sandbox only: no phone service is recharged and no real loan is repaid.', 'Лише sandbox: реальний мобільний рахунок не поповнюється, кредит не погашається.')}</p>
      <form onSubmit={async e => { e.preventDefault(); const data=new FormData(e.currentTarget); await m.run(async () => { setReview({ accountId:String(data.get('accountId')),amount:parseAmount(data.get('amount')),kind,reference:String(data.get('reference')).trim() }) },'') }}>
        <fieldset disabled={m.disabled || !m.accounts.length}>
          <label className={ui.field}>{t('Payment type', 'Тип платежу')}<select value={kind} onChange={e => { setKind(e.target.value); m.clearFeedback() }}><option value="MobileTopUp">{t('Mobile top-up', 'Поповнення мобільного')}</option><option value="LoanRepayment">{t('Loan repayment', 'Погашення кредиту')}</option></select></label>
          <label className={ui.field}>{t('Account', 'Рахунок')}<select name="accountId" required defaultValue={m.activeAccount?.id}>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)} · {m.format(a.balance,a.currency)}</option>)}</select></label>
          <label className={ui.field}>{kind==='MobileTopUp' ? t('Phone number', 'Номер телефону') : t('Loan reference', 'Номер кредитного договору')}<input key={kind} name="reference" type={kind==='MobileTopUp'?'tel':'text'} required minLength={kind==='MobileTopUp'?8:4} maxLength={kind==='MobileTopUp'?16:50} placeholder={kind==='MobileTopUp'?'+380…':'TEST-0001'}/></label>
          <label className={ui.field}>{t('Amount', 'Сума')}<input name="amount" required inputMode="decimal"/></label><button className={ui.buttonPrimary}>{t('Review payment', 'Перевірити платіж')}</button>
        </fieldset>
      </form>
    </section>
    {review && <Dialog title={t('Confirm sandbox payment', 'Підтвердити тестовий платіж')} onClose={() => { if(!m.busy) setReview(null) }}>
      <Feedback error={m.error}/><p>{review.reference} · {m.format(review.amount,m.accounts.find(a=>a.id===review.accountId)?.currency || 'UAH')}</p>
      <button className={ui.buttonPrimary} disabled={m.disabled} onClick={async () => { if(await m.run(()=>m.operation('/api/payments',review),t('Sandbox payment completed.', 'Тестовий платіж виконано.'))) setReview(null) }}>{t('Confirm payment', 'Підтвердити платіж')}</button>
    </Dialog>}
  </WorkspaceLayout>
}
