import { financeApi } from '../api/financeApi.js'
import { AccountSelect, AmountInput, FinanceForm } from './FinanceForm.jsx'

export function PurchasesPanel({ request, accounts, cards, cashback, refresh }) {
  return <section><h2>Навчальні покупки та кешбек</h2>
    <p>Покупки імітуються в sandbox. Кешбек — {cashback?.percentage ?? 1}%, одразу на рахунок. На перекази та поповнення не нараховується.</p>
    <FinanceForm submitLabel="Створити віртуальну картку" disabled={!accounts.length} onSubmit={(data) => financeApi.issueCard(request, data.get('accountId'))} onSuccess={refresh}>
      <AccountSelect accounts={accounts} />
    </FinanceForm>
    <FinanceForm submitLabel="Оплатити навчальну покупку" disabled={!cards.some((card) => card.status === 'Active')} onSubmit={(data, key) =>
      financeApi.money(request, '/api/finance/purchases', { cardId: data.get('cardId'), amount: Number(data.get('amount')) }, key)} onSuccess={refresh}>
      <p><label>Картка <select name="cardId" required defaultValue=""><option value="" disabled>Обери картку</option>
        {cards.filter((card) => card.status === 'Active').map((card) => <option key={card.id} value={card.id}>
          {card.maskedNumber} · {accounts.find((a) => a.id === card.accountId)?.currency}
        </option>)}
      </select></label></p><AmountInput />
      <p>Відрахування в ціль списується додатково до ціни покупки. Якщо на нього бракує коштів, покупка проходить без відрахування.</p>
    </FinanceForm>
    <h3>Останні нарахування кешбеку</h3>
    <ul>{cashback?.transactions.map((t) => <li key={t.id}>{new Date(t.createdAt).toLocaleString()}: +{t.cashback.toFixed(2)} {t.currency} · у ціль {t.saved.toFixed(2)}</li>)}</ul>
  </section>
}
