import { createContext, useContext } from 'react'

export interface KycStatus {
  provider: string
  status: string
  canAccess: boolean
  sandbox: boolean
  failureCode: string | null
  updatedAt: string | null
}
interface KycContextValue {
  status: KycStatus | null
  pending: boolean
  error: string
  load: (synchronize?: boolean) => Promise<KycStatus | null>
}
export const KycContext = createContext<KycContextValue | null>(null)
export function useKyc() {
  const value = useContext(KycContext)
  if (!value) throw new Error('KycProvider is required.')
  return value
}
