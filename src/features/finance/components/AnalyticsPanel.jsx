import { financeApi } from '../api/financeApi.js'
import { FinanceForm } from './FinanceForm.jsx'

const metrics = [
  ['availableBalance', 'Зараз на рахунках'], ['savingsBalance', 'Зараз у накопиченнях'], ['income', 'Надходження'],
  ['expenses', 'Витрати'], ['fees', 'Комісії'], ['cashback', 'Кешбек'], ['savingsDeposited', 'Внесено в цілі'],
  ['savingsWithdrawn', 'Знято з цілей'], ['exchangedOut', 'Віддано на обмін'], ['exchangedIn', 'Отримано з обміну'],
]

export function AnalyticsPanel({ request, analytics, setAnalytics }) {
  const today = new Date().toISOString().slice(0, 10)
  return <section><h2>Фінансова аналітика</h2>
    <FinanceForm submitLabel="Показати" onSubmit={async (data) => {
      setAnalytics(await financeApi.analytics(request, data.get('from'), data.get('through')))
    }}>
      <p><label>З <input name="from" type="date" defaultValue={today.slice(0, 8) + '01'} required /></label></p>
      <p><label>До включно <input name="through" type="date" defaultValue={today} required /></label></p>
    </FinanceForm>
    <p>Операції за обраний період (UTC), залишки — на поточний момент. Власні перекази та накопичення не збільшують доходи або витрати. Комісії показані окремо.</p>
    {analytics && <><p>{analytics.from} — {analytics.through}</p><table>
      <caption>Суми окремо за валютами</caption><thead><tr><th scope="col">Показник</th>{analytics.currencies.map((c) => <th scope="col" key={c.currency}>{c.currency}</th>)}</tr></thead>
      <tbody>{metrics.map(([field, label]) => <tr key={field}><th scope="row">{label}</th>{analytics.currencies.map((c) => <td key={c.currency}>{c[field].toFixed(2)}</td>)}</tr>)}</tbody>
    </table></>}
  </section>
}
