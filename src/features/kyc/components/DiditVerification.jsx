import { useEffect, useRef, useState } from 'react'

export function DiditVerification({ session, refresh }) {
  const [error, setError] = useState('')
  const [qr, setQr] = useState(null)
  const phone = useRef(null)

  useEffect(() => {
    let active = true
    let sdk = null
    let closing = false
    const cameraFallback = () => {
      if (!active) return
      setError('Не вдалося продовжити перевірку на цьому пристрої. Можна продовжити на телефоні за QR нижче.')
      if (!closing) { closing = true; sdk?.close() }
      requestAnimationFrame(() => { if (active) phone.current?.scrollIntoView({ block: 'center' }) })
    }
    import('@didit-protocol/sdk-web').then(({ DiditSdk }) => {
      if (!active) return
      sdk = DiditSdk.shared
      sdk.onComplete = (result) => {
        if (!active) return
        if (result.type === 'failed') cameraFallback()
        // SDK completion is only a request to refresh; the backend decides access.
        void refresh(true).catch(() => {})
      }
      sdk.onEvent = (event) => { if (event.type === 'didit:error') cameraFallback() }
      void sdk.startVerification({ url: session.url, configuration: {
        loggingEnabled: false, showCloseButton: true, showExitConfirmation: true, closeModalOnComplete: true,
      } }).catch(cameraFallback)
    }).catch(cameraFallback)
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(session.url, { errorCorrectionLevel: 'M', width: 220, margin: 2 }))
      .then((value) => { if (active) setQr(value) }).catch(() => {})
    return () => {
      active = false
      if (sdk) { sdk.onComplete = undefined; sdk.onEvent = undefined; sdk.destroy() }
    }
  }, [session.url, refresh])

  return <section aria-label="Перевірка Didit">
    {error && <p role="alert">{error}</p>}
    <p>У формі Didit сфотографуй документ і пройди перевірку обличчя вебкамерою.</p>
    <p><a href={session.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Відкрити перевірку в окремій вкладці</a></p>
    <details ref={phone} open={Boolean(error)}><summary>Продовжити на телефоні через QR</summary>
      <p>Відскануй QR камерою телефона. Відкриється та сама перевірка без повторної реєстрації у Flenta.</p>
      {qr ? <img src={qr} width="220" height="220" alt="QR для продовження перевірки Didit на телефоні" /> : <p>Готуємо QR…</p>}
      <p>Залиш цю сторінку відкритою — статус оновиться після завершення перевірки.</p>
    </details>
  </section>
}
