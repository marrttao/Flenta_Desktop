import { useState } from 'react'
import { financeApi } from '../api/financeApi.js'
import { AccountSelect, AmountInput, FinanceForm } from './FinanceForm.jsx'

function Goal({ goal, request, refresh }) {
  const [mode, setMode] = useState(goal.mode)
  return <article><h3>{goal.name}{goal.archived ? ' (архів)' : ''}</h3>
    <p>{goal.balance.toFixed(2)} / {goal.target.toFixed(2)} {goal.currency} · {goal.progressPercent}%</p>
    <progress max={goal.target} value={Math.min(goal.balance, goal.target)} aria-label={`Прогрес цілі ${goal.name}`} />
    {!goal.archived && <>
      <FinanceForm submitLabel="Зберегти налаштування" onSubmit={(data) => financeApi.updateGoal(request, goal.id, {
        name: data.get('name'), target: Number(data.get('target')), deadline: data.get('deadline') || null,
        mode, percentage: Number(data.get('percentage') ?? goal.percentage), roundUpStep: Number(data.get('roundUpStep') ?? goal.roundUpStep),
      })} onSuccess={refresh}>
        <p><label>Назва <input name="name" defaultValue={goal.name} maxLength={100} required /></label></p>
        <p><label>Мета <input name="target" type="number" min="0.01" max="10000000000" step="0.01" defaultValue={goal.target} required /></label></p>
        <p><label>Дата <input name="deadline" type="date" defaultValue={goal.deadline || ''} /></label></p>
        <p><label>Відрахування від покупок <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="Off">Вимкнено</option><option value="Percentage">Відсоток від покупки</option><option value="RoundUp">Округлення покупки</option>
        </select></label></p>
        {mode === 'Percentage' && <p><label>Відсоток <input name="percentage" type="number" min="0.01" max="100" step="0.01" defaultValue={goal.percentage || 5} required /></label></p>}
        {mode === 'RoundUp' && <p><label>Округляти до <select name="roundUpStep" defaultValue={goal.roundUpStep}>
          {[1, 5, 10, 50, 100].map((step) => <option key={step} value={step}>{step} {goal.currency}</option>)}
        </select></label></p>}
      </FinanceForm>
      <p>Для одного рахунку автоматичні відрахування можна ввімкнути лише в одну ціль. При досягненні мети відрахування зупиняються.</p>
      <FinanceForm submitLabel="Поповнити ціль" onSubmit={(data, key) => financeApi.money(request, `/api/goals/${goal.id}/deposits`, { amount: Number(data.get('amount')) }, key)} onSuccess={refresh}>
        <AmountInput label={`Точна сума поповнення, ${goal.currency}`} />
      </FinanceForm>
      <FinanceForm submitLabel="Повернути на рахунок" onSubmit={(data, key) => financeApi.money(request, `/api/goals/${goal.id}/withdrawals`, { amount: Number(data.get('amount')) }, key)} onSuccess={refresh}>
        <AmountInput label={`Сума зняття, ${goal.currency}`} />
      </FinanceForm>
      <FinanceForm submitLabel="Архівувати порожню ціль" disabled={goal.balance !== 0} onSubmit={() => financeApi.archiveGoal(request, goal.id)} onSuccess={refresh} />
    </>}
  </article>
}

export function GoalsPanel({ accounts, goals, request, refresh }) {
  return <section><h2>Цілі та накопичення</h2>
    <FinanceForm submitLabel="Створити ціль" disabled={!accounts.length} onSubmit={(data) => financeApi.createGoal(request, {
      fundingAccountId: data.get('accountId'), name: data.get('name'), target: Number(data.get('target')), deadline: data.get('deadline') || null,
    })} onSuccess={refresh}>
      <p><label>Назва <input name="name" maxLength={100} required /></label></p>
      <AccountSelect accounts={accounts} label="Рахунок для поповнень і повернення грошей" /><AmountInput name="target" label="Сума цілі у валюті рахунку" />
      <p><label>Бажана дата <input name="deadline" type="date" /></label></p>
    </FinanceForm>
    {goals.map((goal) => <Goal key={`${goal.id}:${goal.mode}`} goal={goal} request={request} refresh={refresh} />)}
  </section>
}
