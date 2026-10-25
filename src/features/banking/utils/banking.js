export function parseAmount(value) {
  const normalized = String(value).trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error('Вкажіть суму з точністю до двох знаків після коми.')
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000_000) {
    throw new Error('Сума має бути більшою за 0 і не перевищувати 10 000 000 000 ₴.')
  }
  return amount
}

export const money = (amount) => new Intl.NumberFormat('uk-UA', {
  style: 'currency', currency: 'UAH', maximumFractionDigits: 2,
}).format(amount)

const messages = {
  'banking.not_configured': 'Банківський API ще не налаштований. Потрібні PostgreSQL, міграції та ключ шифрування карток.',
  'banking.unavailable': 'Банківська база тимчасово недоступна. Спробуйте ще раз.',
  'banking.storage_unavailable': 'Банківська база тимчасово недоступна. Повторіть цю саму операцію або оновіть дані.',
  'banking.not_found': 'Рахунок або картку не знайдено серед доступних вам даних.',
  'account.insufficient_funds': 'На рахунку недостатньо коштів з урахуванням комісії.',
  'transfer.recipient_not_found': 'Рахунок одержувача не знайдено в цій пісочниці.',
  'transfer.same_account': 'Оберіть інший рахунок одержувача.',
  'transaction.key_reused': 'Ключ операції вже використано для іншого запиту.',
  'card.closed': 'Закриту картку не можна активувати повторно.',
  'card.unavailable': 'Реквізити доступні лише для активної непростроченої картки.',
  'auth.invalid_credentials': 'Неправильний пароль або недійсна сесія.',
}

export function bankingError(error) {
  return messages[error.code] || error.message || 'Не вдалося виконати операцію.'
}

export const transactionKind = { TopUp: 'Поповнення', InternalTransfer: 'Між рахунками', IbanTransfer: 'Переказ за IBAN' }
export const statusName = { Active: 'Активна', Blocked: 'Заблокована', Closed: 'Закрита', Completed: 'Виконано', Rejected: 'Відхилено', Pending: 'В обробці' }
