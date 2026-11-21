export interface SupportSummary { id: string; subject: string; kind: string; status: string; updatedAt: string; ownerId: string }
export interface SupportConversation { request: SupportSummary; messages: { id: string; isStaff: boolean; body: string; createdAt: string }[] }
