import { useCallback, useEffect, useState, useMemo, useRef, type ReactNode } from 'react';

import { AuthContext } from './authContext';

import { authApi } from '../api/authApi';
import { ApiError, apiRequest, type ApiRequestOptions } from '../api/httpClient'
import { clearVerifier, getVerifier, startPkce } from '../api/pkce';

import { storageService, StorageKeys } from '../../../storage/index';

import type
{
	AuthContextValue,
	AuthRegisterResult,
	AuthRequestOptions,
	AuthSession,
	AuthSessionInfo,
	AuthUser
} from '../types';

import { useIdleTimeout } from '../hooks/useIdleTimeout';
import { useTokenExpiry } from '../hooks/useTokenExpiry';
import { getTokenExpiryMs } from '../utils/jwtUtils';

import { IdleTimeoutModal } from '../components/IdleTimeoutModal/IdleTimeoutModal';



interface AuthProviderProps
{
	children: ReactNode;
}



function readStatus(error: unknown): number | undefined
{
	if (typeof error === 'object' && error !== null && 'status' in error)
	{
		const value = (error as { status: unknown }).status;
		if (typeof value === 'number') { return value; }
	}
	return undefined;
}

function persist(value: AuthSession | null): void
{
	try
	{
		if (value)
		{
			storageService.setItem(StorageKeys.ACCESS_TOKEN, value.accessToken);
			storageService.setItem(StorageKeys.REFRESH_TOKEN, value.refreshToken);
			storageService.setItem(StorageKeys.SESSION_USER_ID, value.user.id);
		}
		else
		{
			storageService.removeItem(StorageKeys.ACCESS_TOKEN);
			storageService.removeItem(StorageKeys.REFRESH_TOKEN);
			storageService.removeItem(StorageKeys.SESSION_USER_ID);
		}
	}
	catch {}
}

function resolveExpiresAt(value: AuthSession | null): number | null
{
	if (!value) { return null; }
	if (typeof value.expiresIn === 'number' && value.expiresIn > 0) { return Date.now() + value.expiresIn * 1000; }
	return getTokenExpiryMs(value.accessToken);
}


function AuthProvider({ children }: AuthProviderProps)
{
	const [user, setUser] = useState<AuthUser | null>(null);
	const [kycEpoch, setKycEpoch] = useState(0);
	const [isRestoringSession, setIsRestoringSession] = useState(true);
	const [expiresAt, setExpiresAt] = useState<number | null>(null);

	const { msUntilExpiry } = useTokenExpiry(expiresAt);

	const session = useRef<AuthSession | null>(null);
	const version = useRef<number>(0);
	const refresh = useRef<Promise<AuthSession> | null>(null);



	const acceptSession = useCallback
	(
		(value: AuthSession | null) =>
		{
			session.current = value;

			setUser(value?.user ?? null);
			setKycEpoch((epoch) => epoch + 1);
			setExpiresAt(resolveExpiresAt(value));
			persist(value);
		},
		[]
	);

	const request = useCallback
	(
		async <Type = unknown,>(path: string, options?: AuthRequestOptions): Promise<Type> =>
		{
			if (!session.current) { throw new Error("You need to login first"); }

			const currentVersion = version.current;
			const usedToken = session.current.accessToken;
			const send = async (requestOptions: ApiRequestOptions): Promise<Type> =>
			{
				try { return await apiRequest<Type>(path, requestOptions); }
				catch (error)
				{
					if (currentVersion === version.current && !path.startsWith('/api/kyc')
						&& error instanceof ApiError && error.code?.startsWith('kyc.'))
						setKycEpoch((epoch) => epoch + 1);
					throw error;
				}
			};

			try { return await send({ ...options, token: usedToken }); }
			catch (error)
			{
				if (readStatus(error) !== 401 || !session.current || currentVersion !== version.current) { throw error; }
				if (session.current.accessToken !== usedToken) { return send({ ...options, token: session.current.accessToken }); }
				if (!refresh.current)
				{
					refresh.current = (authApi.refresh(session.current.refreshToken) as Promise<AuthSession>)
					.then
					(
						(value: AuthSession) =>
						{
							if (currentVersion !== version.current) { throw new Error("Session was closed!"); }
							
							acceptSession(value);
							return value;
						}
					)
					.catch
					(
						(refreshError: unknown) =>
						{
							if (currentVersion === version.current) { acceptSession(null); }

							throw refreshError;
						}
					)
					.finally(() => { refresh.current = null; });
				}

				const refreshedSession = await refresh.current;
				return send({ ...options, token: refreshedSession.accessToken });
			}
		},
		[acceptSession]
	)

	const login = useCallback
	(
		async (email: string, password: string) =>
		{
			const value = await (authApi.login({email, password}) as Promise<AuthSession>);
			version.current++;
			acceptSession(value);
		},
		[acceptSession]
	);
	const register = useCallback
	(
		async (email: string, password: string, displayName: string): Promise<AuthRegisterResult> =>
		{
			const codeChallenge = await startPkce();
			const result = await (authApi.register({email, password, displayName, codeChallenge}) as Promise<AuthRegisterResult>);

			if (result.session)
			{
				clearVerifier();
				version.current++;
				acceptSession(result.session);
			}

			return result;
		},
		[acceptSession]
	);
	const logout = useCallback
	(
		async () =>
		{
			const token = session.current?.accessToken;

			version.current++;
			acceptSession(null);

			if (token)
			{
				try { await authApi.logout(token); }
				catch {}
			}
		},
		[acceptSession]
	);

	const recover = useCallback
	(
		async (email: string) =>
		{
			const codeChallenge = await startPkce();
			await authApi.recover({ email, codeChallenge });
		},
		[]
	);
	const exchangeCode = useCallback
	(
		async (code: string) =>
		{
			const value = await (authApi.exchange(code, getVerifier()) as Promise<AuthSession>);
			
			clearVerifier();
			version.current++;
			acceptSession(value);
		},
		[acceptSession]
	);

	const updateUser = useCallback
	(
		(profile: AuthUser) =>
		{
			if (session.current?.user.id === profile.id) { acceptSession({ ...session.current, user: profile }); }
		},
		[acceptSession]
	);
	const refreshSession = useCallback
	(
		async () =>
		{
			if (!session.current?.refreshToken) { return; }

			const value = await (authApi.refresh(session.current.refreshToken) as Promise<AuthSession>);

			version.current++;
			acceptSession(value);
		},
		[acceptSession]
	);

	useEffect
	(
		() =>
		{
			let active = true;
			const refreshToken = storageService.getItem(StorageKeys.REFRESH_TOKEN);
			if (!refreshToken) { setIsRestoringSession(false); return; }

			(
				async () =>
				{
					try
					{
						const valie = await (authApi.refresh(refreshToken) as Promise<AuthSession>);

						if (!active) { return; }
						acceptSession(valie);
					}
					catch
					{
						if (!active) { return; }
						acceptSession(null);
					}
					finally
					{
						if (active) { setIsRestoringSession(false); }
					}
				}
			)();

			return () => { active = false; };
		},
		[acceptSession]
	);



	const idle = useIdleTimeout
	(
		{
			expiresAt,
			msBeforeExpiry: 30_000,
			onRefresh: refreshSession,
			onLogout: logout
		}
	);
	const sessionInfo = useMemo<AuthSessionInfo | null>
	(
		() =>
		{
			if (!session.current) { return null; }

			const current = session.current

			return {
				expiresAt,
				msUntilExpiry,
				expiresIn: current?.expiresIn ?? null
			};
		},
		[user, expiresAt, msUntilExpiry]
	);



	const value = useMemo<AuthContextValue>
	(
		() => ({ user, kycEpoch, isRestoringSession, sessionInfo, request, login, register, recover, exchangeCode, logout, updateUser, refreshSession }),
		[user, kycEpoch, isRestoringSession, sessionInfo, request, login, register, recover, exchangeCode, logout, updateUser, refreshSession]
	);



	return (
		<AuthContext.Provider value={value}>
			{children}
			<IdleTimeoutModal isOpen={idle.isModalOpen} secondsLeft={idle.secondsLeft} onStay={idle.stayHere} onLogout={idle.logoutNow}/>
		</AuthContext.Provider>
	);
}



export type { AuthProviderProps };

export { AuthProvider };
