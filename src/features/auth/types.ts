interface AuthUser
{
	id: string;
	displayName: string;
	email?: string;
	emailConfirmed?: boolean;
}

interface AuthSession
{
	user: AuthUser;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

interface AuthSessionInfo
{
	expiresAt: number | null;
	msUntilExpiry: number | null;
	expiresIn: number | null;
}

interface AuthRequestOptions
{
	method?: string;
	body?: unknown;
	idempotencyKey?: string;
}

interface AuthRegisterResult
{
	requiresEmailConfirmation?: boolean;
	session?: AuthSession;
}

interface AuthContextValue
{
	user: AuthUser | null;
	sessionInfo: AuthSessionInfo | null;

	request: <Type = unknown>(path: string, options?: AuthRequestOptions) => Promise<Type>;
	
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, displayName: string) => Promise<AuthRegisterResult>;

	recover: (email: string) => Promise<void>;
	exchangeCode: (code: string) => Promise<void>;
	
	logout: () => Promise<void>;
	
	updateUser: (profile: AuthUser) => void;
	refreshSession: () => Promise<void>;
}



export type { AuthUser, AuthSession, AuthSessionInfo, AuthRequestOptions, AuthRegisterResult, AuthContextValue };