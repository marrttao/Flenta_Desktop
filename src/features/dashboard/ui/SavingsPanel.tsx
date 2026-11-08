import { useState } from 'react'
import type { DashboardModel, Goal } from '../model/useDashboard'
import { parseAmount } from '../../banking/utils/banking.js'
import { Dialog, Feedback, Icon } from './DashboardLayout'
import styles from './Dashboard.module.css'

function GoalEditor({ goal, model: m, onClose }: { goal: Goal; model: DashboardModel; onClose: () => void }) {
  const t = m.text
  const [mode, setMode] = useState(goal.mode)
  return <Dialog title={goal.name} onClose={() => { if (!m.busy) onClose() }}>
    <Feedback model={m}/>
    <p className={styles.goalBalance}>{m.format(goal.balance, goal.currency)} <small>/ {m.format(goal.target, goal.currency)}</small></p>
    <form onSubmit={async e => {
      e.preventDefault(); const data = new FormData(e.currentTarget)
      await m.run(() => m.finance.updateGoal(m.request, goal.id, { name: String(data.get('name')).trim(), target: parseAmount(data.get('target')), deadline: data.get('deadline') || null,
        mode, percentage: mode === 'Percentage' ? parseAmount(data.get('percentage')) : 0, roundUpStep: Number(data.get('roundUpStep') || goal.roundUpStep),
      }), t('Savings settings saved.', 'Налаштування накопичень збережено.'))
    }}><fieldset disabled={m.disabled || goal.archived}>
      <label>{t('Goal name', 'Назва цілі')}<input name="name" defaultValue={goal.name} maxLength={100} required/></label>
      <label>{t('Target amount', 'Сума цілі')} · {goal.currency}<input name="target" defaultValue={goal.target} inputMode="decimal" required/></label>
      <label>{t('Target date (optional)', 'Бажана дата (необов’язково)')}<input name="deadline" type="date" defaultValue={goal.deadline || ''}/></label>
      <label>{t('Save automatically from purchases', 'Автоматично відкладати з покупок')}<select value={mode} onChange={e => setMode(e.target.value as Goal['mode'])}><option value="Off">{t('Off', 'Вимкнено')}</option><option value="RoundUp">{t('Round up purchases', 'Округлення покупок')}</option><option value="Percentage">{t('Percentage of each purchase', 'Відсоток від кожної покупки')}</option></select></label>
      {mode === 'RoundUp' && <label>{t('Round up to the next', 'Округляти до наступних')}<select name="roundUpStep" defaultValue={goal.roundUpStep}>{[1, 5, 10, 50, 100].map(n => <option key={n} value={n}>{n} {goal.currency}</option>)}</select></label>}
      {mode === 'Percentage' && <label>{t('Percentage', 'Відсоток')}<input name="percentage" type="number" min="0.01" max="100" step="0.01" defaultValue={goal.percentage || 5} required/></label>}
      <p className={styles.muted}>{t('Contributions are added to the purchase amount. One automatic goal per funding account; saving stops at the target. If funds are insufficient, the purchase continues without a contribution.', 'Відрахування списуються додатково до суми покупки. Одна автоматична ціль на рахунок; після досягнення мети відрахування зупиняються. Якщо коштів бракує, покупка проходить без відрахування.')}</p>
      <button className={styles.primary} type="submit">{t('Save settings', 'Зберегти налаштування')}</button>
    </fieldset></form>
    {!goal.archived && <>
      <form className={styles.goalMovement} onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        const direction = data.get('direction') === 'withdraw' ? 'withdrawals' : 'deposits'
        await m.run(() => m.operation(`/api/goals/${goal.id}/${direction}`, { amount: parseAmount(data.get('amount')) }), t('Savings balance updated.', 'Баланс накопичення оновлено.'))
      }}><fieldset disabled={m.disabled}>
        <h3>{t('Move funds', 'Рух коштів')}</h3><label>{t('Action', 'Дія')}<select name="direction"><option value="deposit">{t('Add to savings', 'Поповнити ціль')}</option><option value="withdraw">{t('Return to funding account', 'Повернути на рахунок')}</option></select></label>
        <label>{t('Amount', 'Сума')} · {goal.currency}<input name="amount" inputMode="decimal" required/></label><button className={styles.secondary} type="submit">{t('Confirm', 'Підтвердити')}</button>
      </fieldset></form>
      <button className={styles.textButton} type="button" disabled={m.disabled || goal.balance !== 0} onClick={async () => {
        if (await m.run(() => m.finance.archiveGoal(m.request, goal.id), t('Empty goal archived.', 'Порожню ціль архівовано.'))) onClose()
      }}>{t('Archive empty goal', 'Архівувати порожню ціль')}</button>
    </>}
  </Dialog>
}

export function SavingsPanel({ model: m }: { model: DashboardModel }) {
  const t = m.text
  const [creating, setCreating] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = m.goals.find(g => g.id === selectedId)
  const active = m.goals.filter(g => !g.archived)
  return <section className={styles.savings} id="dashboard-savings">
    <header className={styles.sectionHeading}><div><h2><Icon name="savings"/>{t('Piggy bank', 'Накопичення')}</h2><p>{t('Little by little, closer to your goals.', 'Крок за кроком — ближче до своєї мети.')}</p></div><button className={styles.secondary} type="button" disabled={m.disabled || !m.accounts.length} onClick={() => { m.clearFeedback(); setCreating(true) }}><Icon name="plus"/>{t('New goal', 'Нова ціль')}</button></header>
    {m.goalsError ? <p className={styles.error} role="alert">{m.goalsError}</p> : active.length ? <div className={styles.goalsGrid}>{active.map(goal => <button key={goal.id} className={styles.goalCard} type="button" onClick={() => { m.clearFeedback(); setSelectedId(goal.id) }}>
      <span className={styles.goalHeader}><span className={styles.goalIcon}><Icon name="savings"/></span><span className={styles.chip}>{goal.mode === 'RoundUp' ? t('Round-ups', 'Округлення') : goal.mode === 'Percentage' ? `${goal.percentage}%` : t('Manual', 'Вручну')}</span></span>
      <strong>{goal.name}</strong><span className={styles.goalBalance}>{m.format(goal.balance, goal.currency)} <small>/ {m.format(goal.target, goal.currency)}</small></span>
      <progress max={goal.target} value={Math.min(goal.balance, goal.target)} aria-label={`${goal.name}: ${goal.progressPercent}%`}/>
      <span className={styles.goalFooter}>{new Intl.NumberFormat(m.locale, { maximumFractionDigits: 2 }).format(Math.min(goal.progressPercent, 100))}%<span>{t('Manage goal', 'Керувати ціллю')} ↗</span></span>
    </button>)}</div> : <div className={styles.savingsEmpty}><span className={styles.goalIcon}><Icon name="savings"/></span><div><h3>{t('Make room for something bigger', 'Відкладай на щось більше')}</h3><p>{t('Create a goal. Save manually, round up purchases or set aside a percentage.', 'Створи ціль. Поповнюй вручну, округлюй покупки або відкладай відсоток.')}</p></div></div>}
    {m.goals.some(g => g.archived) && <details className={styles.archived}><summary>{t('Archived goals', 'Архівні цілі')}</summary>{m.goals.filter(g => g.archived).map(g => <p key={g.id}>{g.name} · {m.format(g.balance, g.currency)}</p>)}</details>}
    {creating && <Dialog title={t('Create a savings goal', 'Створити ціль накопичення')} onClose={() => { if (!m.busy) setCreating(false) }}><Feedback model={m}/>
      <form onSubmit={async e => {
        e.preventDefault(); const data = new FormData(e.currentTarget)
        if (await m.run(() => m.finance.createGoal(m.request, { fundingAccountId: data.get('fundingAccountId'), name: String(data.get('name')).trim(), target: parseAmount(data.get('target')), deadline: data.get('deadline') || null }), t('Savings goal created.', 'Ціль накопичення створено.'))) setCreating(false)
      }}><fieldset disabled={m.disabled}>
        <label>{t('Goal name', 'Назва цілі')}<input name="name" required maxLength={100} placeholder={t('A new adventure', 'Нова подорож')}/></label>
        <label>{t('Funding account', 'Рахунок для поповнень і повернення коштів')}<select name="fundingAccountId" defaultValue={m.activeAccount?.id} required>{m.accounts.map(a => <option key={a.id} value={a.id}>{a.currency} · …{a.iban.slice(-6)}</option>)}</select></label>
        <label>{t('Target amount in the funding account currency', 'Сума цілі у валюті рахунку')}<input name="target" inputMode="decimal" required/></label>
        <label>{t('Target date (optional)', 'Бажана дата (необов’язково)')}<input name="deadline" type="date" min={new Date().toISOString().slice(0, 10)}/></label>
        <p className={styles.muted}>{t('After creating your goal, choose round-ups or a percentage in its settings.', 'Після створення цілі обери округлення або відсоток у її налаштуваннях.')}</p>
        <button className={styles.primary} type="submit">{t('Create goal', 'Створити ціль')}</button>
      </fieldset></form>
    </Dialog>}
    {selected && <GoalEditor key={selected.id} goal={selected} model={m} onClose={() => setSelectedId(null)}/>}
  </section>
}
