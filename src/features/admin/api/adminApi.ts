import type { AuthContextValue } from '../../auth/types'
import type { AdminClients, AdminOverview } from '../model/types'

type Request = AuthContextValue['request']
const count = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))

export const adminApi = {
  access: async (request: Request) => {
    const result = await request<{ canAccess?: boolean }>('/api/admin/access')
    if (result?.canAccess !== true) throw new Error('Administrator access is required.')
  },
  overview: async (request: Request): Promise<AdminOverview> => {
    const data = await request<AdminOverview>('/api/admin/overview')
    if (!data || !count(data.totalClients) || !count(data.verifiedKycClients) || !count(data.todayTransactions) || data.verifiedKycClients > data.totalClients
      || !date(data.date) || !date(data.updatedAt) || !Array.isArray(data.recentTransactions)
      || data.recentTransactions.length > 7 || data.recentTransactions.some(row => !row || typeof row.id !== 'string' || typeof row.clientName !== 'string'
        || typeof row.kind !== 'string' || typeof row.status !== 'string' || typeof row.currency !== 'string'
        || !/^[A-Z]{3}$/.test(row.currency) || !Number.isFinite(row.amount) || row.amount < 0 || !date(row.createdAt))) throw new Error('Administrative data could not be read.')
    return data
  },
  clients: async (request: Request, email: string, page: number): Promise<AdminClients> => {
    const data = await request<AdminClients>('/api/admin/clients?' + new URLSearchParams({ email, page: String(page), pageSize: '8' }))
    if (!data || !count(data.total) || !count(data.totalClients) || data.total > data.totalClients || data.page !== page || data.pageSize !== 8
      || !Array.isArray(data.items) || data.items.length > 8 || data.items.length > data.total || data.items.some(row => !row || typeof row.id !== 'string'
        || typeof row.displayName !== 'string' || !(row.email === null || typeof row.email === 'string')
        || typeof row.emailConfirmed !== 'boolean' || typeof row.kycStatus !== 'string' || !date(row.createdAt)))
      throw new Error('Client information could not be read.')
    return data
  },
}
