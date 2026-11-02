import { financeApi } from '../api/financeApi.js'
import { AccountSelect, AmountInput, FinanceForm } from './FinanceForm.jsx'

export function AccountsPanel({ request, accounts, refresh }) {
  return <section><h2>Рахунки</h2>
    <ul>{accounts.map((a) => <li key={a.id}>{a.iban}: {a.balance.toFixed(2)} {a.currency}</li>)}</ul>
    <FinanceForm submitLabel="Відкрити рахунок" onSubmit={(data) => financeApi.openAccount(request, data.get('currency'))} onSuccess={refresh}>
      <p><label>Валюта <select name="currency"><option>UAH</option><option>USD</option><option>EUR</option></select></label></p>
    </FinanceForm>
    <h3>Навчальне поповнення</h3>
    <FinanceForm submitLabel="Поповнити" disabled={!accounts.length} onSubmit={(data, key) =>
      financeApi.money(request, `/api/accounts/${data.get('accountId')}/top-ups`, { amount: Number(data.get('amount')) }, key)} onSuccess={refresh}>
      <AccountSelect accounts={accounts} /><AmountInput />
    </FinanceForm>
  </section>
}
