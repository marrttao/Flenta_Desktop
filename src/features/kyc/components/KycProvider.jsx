import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/components/authContext.js'
import { kycApi } from '../api/kycApi.js'
import { KycContext } from './kycContext.js'

export function KycProvider({ children }) {
  const { user, request, kycEpoch } = useAuth()
  const owner = user?.id
  const [result, setResult] = useState(null)
  const generation = useRef(0)
  const inFlight = useRef(null)
  const load = useCallback((synchronize = false) => {
    if (!owner) return Promise.resolve(null)
    const current = generation.current
    // Collapse SDK callbacks and polling into one authoritative status request.
    if (inFlight.current?.generation === current) return inFlight.current.promise
    const promise = (synchronize ? kycApi.refresh(request) : kycApi.status(request))
      .then((status) => {
        if (current === generation.current) setResult({ owner, epoch: kycEpoch, status, error: '' })
        return status
      }).catch((failure) => {
        if (current === generation.current) setResult({ owner, epoch: kycEpoch, status: null, error: failure.message })
        throw failure
      }).finally(() => { if (inFlight.current?.generation === current) inFlight.current = null })
    inFlight.current = { generation: current, promise }
    return promise
  }, [owner, kycEpoch, request])

  useEffect(() => {
    void load().catch(() => {})
    return () => { generation.current += 1 }
  }, [load])

  const active = result?.owner === owner && result?.epoch === kycEpoch ? result : null
  const status = active?.status || null
  useEffect(() => {
    if (!owner || !status || status.canAccess || !['InProgress', 'PendingReview', 'NeedsResubmission'].includes(status.status)) return
    const timer = setInterval(() => { void load(true).catch(() => {}) }, 15000)
    return () => clearInterval(timer)
  }, [owner, status, load])

  return <KycContext.Provider value={{ status, pending: Boolean(owner && !active), error: active?.error || '', load }}>
    {children}
  </KycContext.Provider>
}
