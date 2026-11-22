# Flenta Bank

Desktop frontend in React/TypeScript. New UI is TSX with CSS Modules, using the existing Auth, banking and localization infrastructure.

## Pages
- /: accounts, spending, quick actions and recent operations.
- /cards: virtual cards, protected requisites, freeze/close, payment channels and monthly limits.
- /transfers: own accounts, IBAN or card number, quote/confirmation, memo and saved recipients.
- /exchange: existing NBU-rate quotes and currency exchange.
- /savings: goals, deposits/withdrawals, round-ups, percentages and archive.
- /payments: sandbox mobile top-ups and loan repayment.
- /support: FAQ/search, persisted conversations and callback requests.
- /settings: editable display name, private photo, contact phone, preferences, MFA, sessions and read-only document identity.
- /notifications: owner-scoped in-app inbox.
- /admin, /admin/clients, /admin/clients/:id, /admin/transactions, /admin/kyc, /admin/notifications, /admin/support: staff workspace.

The backend freshly verifies app_metadata.role=admin; the cached frontend flag only controls navigation. Privileged actions show the exact client/account/action, ask for an audit reason and password, and retain the same idempotency key on an ambiguous retry. Legal identity comes from document snapshots; changing a display name does not alter it. MFA verification accepts the replacement server session and rejects late responses from an old session.

Customer banking remains KYC gated. Staff access is checked independently of their own customer KYC. No bypass/demo data is included in the production frontend. The optional local synthetic QA host is outside this repository.

## Run and verify

    npm ci
    npm run dev
    npm run typecheck
    npm run lint
    npm test
    npm run build

Set VITE_API_BASE_URL in the local environment to the backend origin. Secrets, server keys and passwords never belong in Vite variables. Backend setup, endpoint contracts and pending migrations are documented in the backend repository at docs/DESKTOP.md.

Banking operations use virtual sandbox funds. External card issuing, telco/loan delivery, browser push, email and SMS are not claimed. Support conversations refresh in the background without clearing a typed message. A statement exports the selected UTC date range (up to 10,000 rows), rather than the currently displayed page.

Design reference: [FLENTA · app Dekstop](https://www.figma.com/design/etI5H9Od4uSZFMfsw8538r/FLENTA?node-id=57-776). Existing assets/fonts/icon system are reused. Loading, unavailable, forbidden and empty states reflect backend responses; missing configuration does not silently produce sample clients or balances.
