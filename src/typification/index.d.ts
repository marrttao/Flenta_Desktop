export interface User
{
	id: string;
	displayName: string;
}






export interface ApiError
{
	message: string;
	code?: string;
}

export interface ApiResponse<Type>
{
	data: Type | null;
	error: ApiError | null;
}






export type CurrencyCode = string;

export interface Currency
{
	code: CurrencyCode;
}

export interface Rate
{
	code: CurrencyCode;
	rate: number;
	date: string;
}

export interface UserCurrency
{
	code: CurrencyCode;
	order: number;
}