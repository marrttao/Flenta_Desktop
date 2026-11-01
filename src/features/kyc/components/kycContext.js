import { createContext, useContext } from 'react'

export const KycContext = createContext(null)
export function useKyc() {
  const value = useContext(KycContext)
  if (!value) throw new Error('KycProvider is required.')
  return value
}
