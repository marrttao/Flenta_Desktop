export type FaqTopic = 'cards' | 'transfers' | 'account'

export interface FaqEntry { id: string; topic: FaqTopic; question: [en: string, uk: string]; answer: [en: string, uk: string] }

/** Help-center answers describing how this version of Flenta actually works. */
export const faq: FaqEntry[] = [
  { id: 'freeze', topic: 'cards',
    question: ['How do I freeze or unfreeze my card?', 'Як заморозити або розморозити картку?'],
    answer: ['Open Cards, select your card and choose Freeze card. You can unfreeze your own freeze in the same place. Contact support if an administrator restricted the card. Your card details and balance stay safe.', 'Відкрий «Картки», обери картку й натисни «Заморозити картку». Власну заморозку можна скасувати там само. Якщо картку обмежив адміністратор, звернися до підтримки. Реквізити та баланс залишаються в безпеці.'] },
  { id: 'details', topic: 'cards',
    question: ['How can I see my full card number and CVV?', 'Як побачити повний номер картки та CVV?'],
    answer: ['Open Cards and choose Show card details. Confirm your account password; the details are hidden again after 60 seconds.', 'Відкрий «Картки» й натисни «Показати реквізити». Підтвердь пароль облікового запису — через 60 секунд реквізити знову сховаються.'] },
  { id: 'close', topic: 'cards',
    question: ['What happens when I close a card?', 'Що буде, якщо закрити картку?'],
    answer: ['A closed card cannot be reactivated. The linked account and its balance remain available, and you can create a new card at any time.', 'Закриту картку неможливо активувати повторно. Пов’язаний рахунок і баланс залишаються доступними, а нову картку можна створити будь-коли.'] },
  { id: 'speed', topic: 'transfers',
    question: ['How long does a transfer take?', 'Скільки триває переказ?'],
    answer: ['Transfers between Flenta accounts and by IBAN inside the sandbox are usually instant. You will see the status in your transaction history.', 'Перекази між рахунками Flenta та за IBAN у пісочниці зазвичай миттєві. Статус видно в історії операцій.'] },
  { id: 'fees', topic: 'transfers',
    question: ['Are there any transfer fees?', 'Чи є комісія за переказ?'],
    answer: ['The fee is calculated before you confirm and is shown in the transfer summary together with the total amount to be debited.', 'Комісія розраховується до підтвердження й показується в підсумку переказу разом із загальною сумою списання.'] },
  { id: 'exchange', topic: 'transfers',
    question: ['How does currency exchange work?', 'Як працює обмін валют?'],
    answer: ['Choose two of your accounts in different currencies and review the exchange. The quote uses the official NBU rate and is valid for a limited time.', 'Обери два свої рахунки в різних валютах і розрахуй обмін. Розрахунок використовує офіційний курс НБУ та діє обмежений час.'] },
  { id: 'statement', topic: 'account',
    question: ['Where can I download my statement?', 'Де завантажити виписку?'],
    answer: ['On Home, choose Statement under Quick actions and select your dates to download all transactions in that period as CSV (up to 10,000 rows).', 'На головній обери «Виписка» у швидких діях і вкажи дати для завантаження всіх операцій за період у CSV (до 10 000 рядків).'] },
  { id: 'verification', topic: 'account',
    question: ['Why do I need to verify my identity?', 'Навіщо підтверджувати особу?'],
    answer: ['Identity verification (KYC) is required before you can use accounts, cards and transfers. You can check its status in Settings.', 'Підтвердження особи (KYC) потрібне для доступу до рахунків, карток і переказів. Статус можна переглянути в налаштуваннях.'] },
  { id: 'password', topic: 'account',
    question: ['How do I change my password?', 'Як змінити пароль?'],
    answer: ['Open Settings and choose Change next to Password in the Security section.', 'Відкрий «Налаштування» й натисни «Змінити» біля пароля в розділі «Безпека».'] },
  { id: 'phone', topic: 'account',
    question: ['How do I change my phone number?', 'Як змінити номер телефону?'],
    answer: ['Open Settings → Account preferences, enter your international phone number and choose Save preferences. This is a contact number; it does not replace your email sign-in.', 'Відкрий «Налаштування» → «Налаштування рахунку», введи міжнародний номер і натисни «Зберегти налаштування». Це контактний номер, він не замінює вхід за email.'] },
]
