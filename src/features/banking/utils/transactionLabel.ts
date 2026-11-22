type Text = (en: string, uk: string) => string

export function transactionLabel(kind: string, t: Text) {
  const labels: Record<string, string> = {
    TopUp: t('Top up', 'Поповнення'), InternalTransfer: t('Internal transfer', 'Між рахунками'),
    IbanTransfer: t('IBAN transfer', 'Переказ за IBAN'), Purchase: t('Card payment', 'Оплата карткою'),
    SavingsDeposit: t('Savings deposit', 'Поповнення цілі'), SavingsWithdrawal: t('Savings withdrawal', 'Повернення з цілі'),
    Exchange: t('Currency exchange', 'Обмін валют'),
    CardTransfer: t('Card transfer', 'Переказ на картку'), AdminAdjustment: t('Administrative adjustment', 'Адміністративне коригування'),
    Compensation: t('Transaction compensation', 'Компенсація операції'), MobileTopUp: t('Mobile top-up', 'Поповнення мобільного'),
    LoanRepayment: t('Loan repayment', 'Погашення кредиту'), CashWithdrawal: t('Cash withdrawal', 'Зняття готівки'),
  }
  return labels[kind] || kind
}

export function transactionStatus(status: string, t: Text) {
  return ({ Completed: t('Completed', 'Виконано'), Rejected: t('Declined', 'Відхилено'), Pending: t('Pending', 'В обробці') } as Record<string, string>)[status] || status
}

/** Last four digits of a masked card number, e.g. "**** **** **** 4582" → "4582". */
export function lastDigits(maskedNumber: string) {
  return maskedNumber.replace(/\D/g, '').slice(-4)
}

export function formatIban(iban: string) {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}
