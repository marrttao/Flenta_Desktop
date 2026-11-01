import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../auth/components/authContext.js'
import { Link } from '../../../app/routes/Link.jsx'
import { createBankingApi } from '../api/bankingApi.js'
import { bankingError, money, parseAmount, statusName, transactionKind } from '../utils/banking.js'

function AccountOptions({ accounts, exclude }) {
  return accounts.map((account, index) => account.id === exclude ? null :
    <option key={account.id} value={account.id}>Рахунок {index + 1} · {account.iban.slice(-6)} · {money(account.balance)}</option>)
}

function Status({ value }) {
  return <span>{statusName[value] || value}</span>
}

function Dialog({ title, onClose, children }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  return <dialog ref={dialog} aria-labelledby="bank-dialog-title" onCancel={onClose}>
    <div><h2 id="bank-dialog-title">{title}</h2><button type="button" onClick={onClose} aria-label="Закрити вікно">×</button></div>
    {children}
  </dialog>
}

function CardRequisites({ card, api, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [secrets, setSecrets] = useState(null)
  useEffect(() => {
    if (!secrets) return
    const timeout = window.setTimeout(onClose, 60_000)
    return () => window.clearTimeout(timeout)
  }, [secrets, onClose])
  async function reveal(event) {
    event.preventDefault()
    const password = new FormData(event.currentTarget).get('password')
    event.currentTarget.reset()
    setBusy(true)
    setError('')
    try { setSecrets(await api.requisites(card.id, password)) }
    catch (failure) { setError(bankingError(failure)) }
    finally { setBusy(false) }
  }
  return <Dialog title="Реквізити тестової картки" onClose={onClose}>
    {secrets ? <div>
      <p>Приховаються автоматично через 60 секунд.</p>
      <dl><dt>Номер картки</dt><dd>{secrets.number.replace(/(.{4})/g, '$1 ').trim()}</dd>
        <dt>Дійсна до</dt><dd>{String(secrets.expiryMonth).padStart(2, '0')}/{String(secrets.expiryYear).slice(-2)}</dd><dt>CVV</dt><dd>{secrets.cvv}</dd></dl>
      <button onClick={onClose}>Приховати реквізити</button>
    </div> : <form onSubmit={reveal}>
      <p>Підтвердьте пароль свого облікового запису для картки {card.maskedNumber.slice(-4)}.</p>
      {error && <p role="alert">{error}</p>}
      <fieldset disabled={busy}><label htmlFor="card-password">Пароль облікового запису</label>
        <input id="card-password" name="password" type="password" required maxLength={128} autoComplete="current-password" autoFocus />
        <button type="submit">{busy ? 'Перевіряємо…' : 'Показати реквізити'}</button></fieldset>
    </form>}
  </Dialog>
}

export function BankingPage() {
  const { user, request } = useAuth()
  const api = useMemo(() => createBankingApi(request), [request])
  const [data, setData] = useState({ accounts: [], cards: [], transactions: [] })
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [offset, setOffset] = useState(0)
  const [accountId, setAccountId] = useState('')
  const [cardId, setCardId] = useState('')
  const [modal, setModal] = useState(null)
  const [recipientMode, setRecipientMode] = useState('own')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('100')
  const [quote, setQuote] = useState(null)
  const generation = useRef(0)
  const actionInFlight = useRef(false)
  const { accounts, cards, transactions } = data
  const activeAccount = accounts.find((account) => account.id === accountId) || accounts[0]
  const activeCard = cards.find((card) => card.id === cardId) || cards[0]
  const disabled = !user || busy || loading
  const closeModal = useCallback(() => setModal(null), [])

  const refresh = useCallback(async () => {
    const current = ++generation.current
    const snapshot = await api.snapshot(offset)
    if (current === generation.current) { setData(snapshot); setLoaded(true) }
  }, [api, offset])

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.resolve().then(async () => {
      if (!active) return
      setLoading(true)
      setError('')
      try { await refresh() }
      catch (failure) { if (active) setError(bankingError(failure)) }
      finally { if (active) setLoading(false) }
    })
    return () => { active = false; generation.current += 1 }
  }, [user, refresh])

  async function run(task, successMessage) {
    if (actionInFlight.current) return
    actionInFlight.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await task()
      if (result?.status === 'Rejected') {
        setError(bankingError({ code: result.failureCode, message: 'Операцію відхилено.' }))
      } else if (successMessage) setNotice(successMessage)
      try { await refresh() }
      catch { setError('Дію завершено, але не вдалося оновити дані. Натисніть «Оновити».') }
      return result
    } catch (failure) { setError(bankingError(failure)) }
    finally { setBusy(false); actionInFlight.current = false }
  }

  function transferDraft() {
    if (!activeAccount) throw new Error('Спочатку відкрийте рахунок.')
    const parsedAmount = parseAmount(amount)
    const byIban = recipientMode === 'iban'
    const target = destination.trim()
    if (!target) throw new Error('Вкажіть одержувача.')
    if (!byIban && !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(target)) {
      throw new Error('Вкажіть коректний ID рахунку одержувача.')
    }
    if (!byIban && target.toLowerCase() === activeAccount.id.toLowerCase()) throw new Error('Оберіть інший рахунок одержувача.')
    const iban = target.replace(/\s/g, '').toUpperCase()
    if (byIban && !/^UA\d{27}$/.test(iban)) throw new Error('IBAN має містити UA та 27 цифр.')
    return {
      byIban,
      body: { sourceAccountId: activeAccount.id, amount: parsedAmount, ...(byIban ? { iban } : { destinationAccountId: target }) },
    }
  }

  async function previewTransfer(event) {
    event.preventDefault()
    setQuote(null)
    await run(async () => {
      const draft = transferDraft()
      const preview = await api.quote({ sourceAccountId: draft.body.sourceAccountId, amount: draft.body.amount, byIban: draft.byIban })
      setQuote({ ...preview, draft })
    })
  }

  function changeAccount(value) { setAccountId(value); setQuote(null); setDestination('') }

  return <div>
    <div><div><h1>Мій банк</h1>
      <p>Рахунки, картки та перекази в одному місці.</p></div>
      <button disabled={disabled} onClick={() => run(async () => {}, 'Дані оновлено.')}>{loading || busy ? 'Оновлюємо…' : 'Оновити'}</button>
    </div>
    <div><p><strong>Тестовий банкінг.</strong> Усі баланси, картки та перекази в цій пісочниці віртуальні.</p></div>
    {!user && <div><Link to="/auth/sign-in">Увійдіть</Link> або <Link to="/auth/sign-up">зареєструйтеся</Link>, щоб відкрити рахунок і перевірити операції.</div>}
    <div aria-live="polite">
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </div>
    <section aria-label="Огляд рахунків">
      <h2>Огляд рахунків</h2>
      <dl><dt>Загальний баланс</dt><dd>{user && loaded ? money(accounts.reduce((sum, account) => sum + account.balance, 0)) : '— ₴'}</dd>
        <dt>Рахунки</dt><dd>{loaded ? accounts.length : '—'}</dd>
        <dt>Активні картки</dt><dd>{loaded ? cards.filter((card) => card.status === 'Active').length : '—'}</dd></dl>
    </section>

    <div>
      <section id="accounts"><div><h2>Мої рахунки</h2><span>UAH</span></div>
        {accounts.length ? <><label htmlFor="active-account">Поточний рахунок</label>
          <select id="active-account" value={activeAccount.id} disabled={disabled} onChange={(event) => changeAccount(event.target.value)}><AccountOptions accounts={accounts} /></select>
          <div>{money(activeAccount.balance)}</div>
          <dl><dt>IBAN</dt><dd>{activeAccount.iban}</dd><dt>ID рахунку</dt><dd>{activeAccount.id}</dd></dl>
        </> : <div><h3>Почніть із рахунку</h3><p>Відкрийте перший рахунок, щоб створити картку та поповнити баланс.</p></div>}
        <button disabled={disabled} onClick={() => run(async () => { const account = await api.openAccount(); setAccountId(account.id); return account }, 'Рахунок відкрито. Тепер його можна поповнити.')}>+ Відкрити рахунок</button>
        <form onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          run(() => api.topUp(activeAccount.id, parseAmount(form.get('amount'))), 'Тестове поповнення виконано.')
        }}><fieldset disabled={disabled || !activeAccount}><label htmlFor="topup-amount">Поповнити поточний рахунок</label>
          <div><div><input id="topup-amount" name="amount" inputMode="decimal" defaultValue="1000" required aria-label="Сума поповнення" /><span>₴</span></div>
            <button type="submit">Поповнити</button></div></fieldset></form>
      </section>

      <section id="cards"><div><h2>Мої картки</h2><span>Віртуальні</span></div>
        {cards.length > 0 && <><label htmlFor="active-card">Оберіть картку</label><select id="active-card" value={activeCard.id} disabled={disabled} onChange={(event) => setCardId(event.target.value)}>
          {cards.map((card) => <option key={card.id} value={card.id}>{card.maskedNumber} · {statusName[card.status]}</option>)}</select></>}
        {activeCard && <dl>
          <dt>Номер картки</dt><dd>{activeCard.maskedNumber}</dd>
          <dt>Власник</dt><dd>{user?.displayName}</dd>
          <dt>Дійсна до</dt><dd>{String(activeCard.expiryMonth).padStart(2, '0')}/{String(activeCard.expiryYear).slice(-2)}</dd>
        </dl>}
        {activeCard ? <><p><Status value={activeCard.status} />{' · '}Рахунок {accounts.find((account) => account.id === activeCard.accountId)?.iban.slice(-6)}</p>
          <div><button disabled={disabled || activeCard.status !== 'Active'} onClick={() => setModal({ kind: 'requisites', card: activeCard })}>Реквізити</button>
            <button disabled={disabled || activeCard.status === 'Closed'} onClick={() => run(() => api.changeCard(activeCard.id, activeCard.status === 'Blocked' ? 'unblock' : 'block'), activeCard.status === 'Blocked' ? 'Картку розблоковано.' : 'Картку заблоковано.')}>
              {activeCard.status === 'Blocked' ? 'Розблокувати' : 'Заблокувати'}</button>
            <button disabled={disabled || activeCard.status === 'Closed'} onClick={() => setModal({ kind: 'close', card: activeCard })}>Закрити</button></div>
        </> : <p>Поки що немає карток. Випустіть картку до поточного рахунку.</p>}
        <button disabled={disabled || !activeAccount} onClick={() => run(async () => { const card = await api.createCard(activeAccount.id); setCardId(card.id); return card }, 'Віртуальну картку створено.')}>+ Створити картку{activeAccount ? ` · ${activeAccount.iban.slice(-6)}` : ''}</button>
      </section>
    </div>

    <section id="transfers"><div><div><h2>Новий переказ</h2><p>Спочатку розрахуйте суму, потім підтвердьте операцію.</p></div></div>
      <form onSubmit={previewTransfer}><fieldset disabled={disabled || !activeAccount}>
        <div><div><label htmlFor="transfer-source">З рахунку</label><select id="transfer-source" value={activeAccount?.id || ''} onChange={(event) => changeAccount(event.target.value)}>
          {!accounts.length && <option value="">Спочатку відкрийте рахунок</option>}<AccountOptions accounts={accounts} /></select></div>
          <div><label htmlFor="recipient-mode">Спосіб переказу</label><select id="recipient-mode" value={recipientMode} onChange={(event) => { setRecipientMode(event.target.value); setDestination(''); setQuote(null) }}>
            <option value="own">Між моїми рахунками</option><option value="account">На інший рахунок за ID</option><option value="iban">За IBAN</option></select></div>
          <div><label htmlFor="transfer-amount">Сума переказу</label><div><input id="transfer-amount" inputMode="decimal" value={amount} required onChange={(event) => { setAmount(event.target.value); setQuote(null) }} /><span>₴</span></div></div>
        </div>
        <label htmlFor="transfer-destination">{recipientMode === 'iban' ? 'IBAN одержувача' : 'Рахунок одержувача'}</label>
        {recipientMode === 'own' ? <select id="transfer-destination" required value={destination} onChange={(event) => { setDestination(event.target.value); setQuote(null) }}>
          <option value="">Оберіть інший рахунок</option><AccountOptions accounts={accounts} exclude={activeAccount?.id} /></select>
          : <input id="transfer-destination" required value={destination} placeholder={recipientMode === 'iban' ? 'UA…' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'} maxLength={recipientMode === 'iban' ? 64 : 36} onChange={(event) => { setDestination(event.target.value); setQuote(null) }} />}
        {recipientMode === 'own' && accounts.length < 2 && <p>Відкрийте другий рахунок для переказу між своїми рахунками.</p>}
        {recipientMode === 'iban' && <p>Переказ доступний на IBAN рахунку, відкритого в цій пісочниці.</p>}
        <button type="submit">Розрахувати переказ</button>
        {quote && <div aria-live="polite"><dl><div><dt>Сума</dt><dd>{money(quote.amount)}</dd></div><div><dt>Комісія</dt><dd>{money(quote.fee)}</dd></div><div><dt>До списання</dt><dd>{money(quote.total)}</dd></div></dl>
          {!quote.sufficientFunds && <p role="alert">Недостатньо коштів. Поповніть рахунок або зменште суму.</p>}
          <button type="button" disabled={!quote.sufficientFunds} onClick={() => run(async () => {
            const result = await api.transfer(quote.draft.byIban, quote.draft.body)
            setQuote(null)
            return result
          }, 'Переказ виконано. Баланси та історію оновлено.')}>Підтвердити переказ · {money(quote.total)}</button>
        </div>}
      </fieldset></form>
    </section>

    <section id="history"><div><h2>Історія операцій</h2><span>Останні операції</span></div>
      {transactions.length ? <div><table><thead><tr><th>Операція / дата</th><th>Напрямок</th><th>Сума</th><th>Комісія</th><th>Статус</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}>
        <td><strong>{transactionKind[transaction.kind] || transaction.kind}</strong><br /><small>{new Date(transaction.createdAt).toLocaleString('uk-UA')}</small></td>
        <td><span>{transaction.sourceAccountId ? `…${transaction.sourceAccountId.slice(-6)}` : 'Поповнення'} → {transaction.destinationIban || `…${transaction.destinationAccountId?.slice(-6) || '—'}`}</span>
          {transaction.failureCode && <small>{bankingError({ code: transaction.failureCode, message: transaction.failureCode })}</small>}</td>
        <td>{money(transaction.amount)}</td><td>{money(transaction.fee)}</td><td><Status value={transaction.status} /></td>
      </tr>)}</tbody></table></div> : <div><h3>Операцій поки немає</h3><p>Поповніть рахунок або виконайте переказ — операція з’явиться тут.</p></div>}
      <div><button disabled={disabled || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>← Новіші</button>
        <span>Сторінка {offset / 20 + 1}</span><button disabled={disabled || transactions.length < 20 || offset >= 10000} onClick={() => setOffset((value) => value + 20)}>Старіші →</button></div>
    </section>
    <p>Відкрийте рахунок → поповніть → створіть картку → виконайте переказ.</p>
    {modal?.kind === 'requisites' && <CardRequisites card={modal.card} api={api} onClose={closeModal} />}
    {modal?.kind === 'close' && <Dialog title="Закрити картку?" onClose={closeModal}><p>Картку {modal.card.maskedNumber} не можна буде активувати повторно. Рахунок і його баланс залишаться доступними.</p>
      <div><button disabled={busy} onClick={closeModal}>Скасувати</button><button disabled={busy} onClick={() => run(async () => {
        const result = await api.changeCard(modal.card.id, 'close'); closeModal(); return result
      }, 'Картку закрито.')}>Закрити картку</button></div></Dialog>}
  </div>
}
