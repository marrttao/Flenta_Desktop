export interface ApiRequestOptions
{
	method?: string;
	body?: unknown;
	token?: string | null;
	idempotencyKey?: string;
}

export class ApiError extends Error
{
	constructor(message: string, status: number, code?: string);

	status: number;
	code?: string;
}

export function apiRequest<Type = unknown>(path: string, options?: ApiRequestOptions): Promise<Type>;