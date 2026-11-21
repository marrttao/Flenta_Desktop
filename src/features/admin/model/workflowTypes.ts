import type { AdminClient, AdminTransaction } from './types'
export interface AdminAccount { id: string; currency: string; balance: number; iban: string | null; blocked: boolean }
export interface Audit { id: string; actorId: string; action: string; reason: string; transactionId: string | null; createdAt: string }
import type { IdentityData } from '../../profile/model/identity'
export type { IdentityData } from '../../profile/model/identity'
export interface ClientDetail { client: AdminClient; phone: string; blocked: boolean; cardsFrozen: boolean; accounts: AdminAccount[]; audit: Audit[];identity:IdentityData|null }
export interface KycItem { id: string; ownerId: string; displayName: string; email: string | null; status: string; provider: string; attempt: number; sandbox: boolean; createdAt: string; manualDecision: boolean | null; taxNumber: string|null }
export interface KycPage { items: KycItem[]; total: number; page: number; awaitingDecision:number;inReview:number;approvedToday:number }
export interface TransactionPage { items: AdminTransaction[]; total: number; page: number; date:string;transactionsForDay:number;completedForDay:number;attentionForDay:number }
