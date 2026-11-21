import type { DashboardModel, Transaction } from '../model/useDashboard'
import { Dialog } from '../../workspace/ui/Dialog'
import { Feedback } from './DashboardLayout'
import { currentMonthRange } from '../model/dateRange.js'
import styles from './Dashboard.module.css'
export function StatementDialog({ model:m }: { model:DashboardModel }) {
  const range=currentMonthRange()
  return <Dialog title={m.text('Download statement', 'Завантажити виписку')} onClose={()=>{if(!m.busy)m.setAction(null)}}>
    <Feedback model={m}/><p className={styles.muted}>{m.text('All account transactions for the selected UTC dates, up to 10,000 rows. Choose a shorter period for larger histories.', 'Усі операції рахунків за обрані дати UTC, до 10 000 рядків. Для більшої історії обери коротший період.')}</p>
    <form onSubmit={async e=>{
      e.preventDefault(); const data=new FormData(e.currentTarget)
      await m.run(async()=>{
        const rows=await m.request<Transaction[]>('/api/statements?'+new URLSearchParams({from:String(data.get('from')),through:String(data.get('through'))}))
        const cell=(value:unknown)=>{const s=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'":'')+s.replace(/"/g,'""')+'"'}
        const values=[['Date UTC','ID','Operation','Amount','Currency','Fee','Status','Source account','Destination account','Recipient IBAN','Received amount','Received currency','Cashback','Savings','Message'],...rows.map(r=>[r.createdAt,r.id,r.kind,r.amount,r.currency,r.fee,r.status,r.sourceAccountId||'',r.destinationAccountId||'',r.destinationIban||'',r.receivedAmount??'',r.destinationCurrency||'',r.cashback??0,r.saved??0,r.memo||''])]
        const url=URL.createObjectURL(new Blob(['\uFEFF'+values.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}))
        const link=document.createElement('a');link.href=url;link.download='flenta-statement-'+data.get('from')+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
      },m.text('Statement downloaded.', 'Виписку завантажено.'))
    }}><fieldset disabled={m.disabled}><label>{m.text('From', 'Від')}<input name="from" type="date" defaultValue={range.from} required/></label><label>{m.text('Through', 'До')}<input name="through" type="date" defaultValue={range.through} required/></label><button className={styles.primary}>{m.text('Download CSV', 'Завантажити CSV')}</button></fieldset></form>
  </Dialog>
}
