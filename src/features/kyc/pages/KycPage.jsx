import { useState } from 'react'
import { useAuth } from '../../auth/components/authContext.js'
import { useKyc } from '../components/kycContext.js'
import { kycApi } from '../api/kycApi.js'
import { DiditVerification } from '../components/DiditVerification.jsx'

const statuses = {
  NotStarted: 'Підтвердь особу, щоб завершити реєстрацію.',
  InProgress: 'Перевірку розпочато. Завантаж документ і пройди перевірку обличчя.',
  PendingReview: 'Документи на перевірці. Доступ відкриється після підтвердження.',
  NeedsResubmission: 'Потрібно виправити або повторно надати документи. Відкрий форму перевірки.',
  Rejected: 'У підтвердженні особи відмовлено. Для подальших дій звернися до підтримки.',
  Verified: 'Особу підтверджено.',
  Expired: 'Термін перевірки минув. Почни нову перевірку.',
}

export function KycPage() {
  const { user, request } = useAuth()
  const { status, pending, error, load } = useKyc()
  const [session, setSession] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const mayStart = user.emailConfirmed && status && ['NotStarted', 'InProgress', 'NeedsResubmission', 'Expired'].includes(status.status)
  return <section><h1>Підтвердження особи</h1>
    <p>Реєстрація завершиться після успішної перевірки KYC. До цього інші розділи Flenta недоступні.</p>
    {!user.emailConfirmed && <p role="alert">Спочатку підтвердь пошту за посиланням із листа.</p>}
    {pending && <p role="status">Отримуємо статус перевірки…</p>}
    {error && <p role="alert">{error}</p>}
    {actionError && <p role="alert">{actionError}</p>}
    {status && <p role="status">{statuses[status.status] || 'Перевірка ще не завершена.'}</p>}
    {status?.sandbox && <p>Тестове середовище Didit. Результати sandbox не є перевіркою реальних документів.</p>}
    {status?.failureCode === 'kyc.requirements_not_met' && <p>Потрібні українська ID-картка або закордонний паспорт та успішна перевірка обличчя.</p>}
    <button type="button" disabled={busy || pending} onClick={async () => {
      setBusy(true); setActionError('')
      try { await load(Boolean(status && status.status !== 'NotStarted')) } catch (failure) { setActionError(failure.message) }
      finally { setBusy(false) }
    }}>Оновити статус</button>
    {mayStart && <button type="button" disabled={busy} onClick={async () => {
      setBusy(true); setActionError('')
      try {
        const result = await kycApi.session(request)
        setSession({ ...result, launch: crypto.randomUUID() })
        await load()
      } catch (failure) { setActionError(failure.message) }
      finally { setBusy(false) }
    }}>{session ? 'Відкрити форму повторно' : status.status === 'NotStarted' ? 'Почати перевірку' : 'Продовжити перевірку'}</button>}
    {session && <DiditVerification key={session.launch} session={session} refresh={load} />}
  </section>
}
