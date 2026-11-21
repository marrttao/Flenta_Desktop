export interface AdminTransaction {
  id: string; clientId: string; clientName: string; clientEmail: string | null
  kind: string; amount: number; currency: string; status: string; createdAt: string
}
export interface AdminOverview {
  totalClients: number; verifiedKycClients: number; todayTransactions: number
  date: string; updatedAt: string; recentTransactions: AdminTransaction[]
}
export interface AdminClient {
  id: string; displayName: string; email: string | null; emailConfirmed: boolean
  kycStatus: string; createdAt: string
}
export interface AdminClients {
  items: AdminClient[]; total: number; totalClients: number; page: number; pageSize: number
}
export type AdminLoad<T> =
  | { key: string; status: 'loading' }
  | { key: string; status: 'ready'; data: T }
  | { key: string; status: 'error'; error: string; forbidden: boolean }
