import { useState } from 'react';
import { Link } from '../../../app/routes/Link';

import { useAuth } from '../providers/authContext';

import { storageService, StorageKeys } from '../../../storage/index';

import { IdleTimeoutModal } from '../components/IdleTimeoutModal/IdleTimeoutModal';



function truncate(value: string | null):string
{
	if (!value) { return '-'; }
	return value.length > 20 ? `${value.slice(0, 20)}` : value;
}

function iso(ms: number | null): string | null { return ms ? new Date(ms).toISOString() : null; }



function AuthTest()
{
	const { user, sessionInfo } = useAuth();
	
	const [simulated, setSimulated] = useState<number | null>(null);
	const [result, setResult] = useState<string>('');



	const hasAccess = storageService.getItem<string>(StorageKeys.ACCESS_TOKEN);
	const hasRefresh = storageService.getItem<string>(StorageKeys.REFRESH_TOKEN);
	const userId = storageService.getItem<string>(StorageKeys.SESSION_USER_ID);

	const sessionJson = user
		?
		{
			user: { id: user.id, displayName: user.displayName, email: user.email ?? null, emailConfirmed: user.emailConfirmed ?? null},
			sessionInfo: sessionInfo
				?
				{
					expiresIn: sessionInfo.expiresIn,
			        expiresAt: iso(sessionInfo.expiresAt),
			        msUntilExpiry: sessionInfo.msUntilExpiry,
				}
				:
				null
		}
		:
		null;
	
	return (
		<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
			<h1>Auth Test</h1>

			<section>
				<h3>Session</h3>
				{ user ? <pre>{JSON.stringify(sessionJson, null, 4)}</pre> : <p>Not logged in. <Link to='/auth/sign-in'>Login</Link></p> }
			</section>

			<section>
				<h3>Storage</h3>

				<ul>
					<li>ACCESS_TOKEN: {hasAccess ? '[TRUE]' : '[FALSE]'}</li>
					<li>REFRESH_TOKEN: {hasRefresh ? '[TRUE]' : '[FALSE]'}</li>
					<li>SESSION_USER_ID: {userId ? '[TRUE]' : '[FALSE]'}</li>
				</ul>

				<div style={{ display: 'flex', gap: 8 }}>
					<button type="button" onClick={() => { storageService.clearSensitive(); setResult('Sensetive storage was cleared!')}}>Clear tokens</button>
				</div>
			</section>

			<section>
				<h3>Idle Modal</h3>

				<div style={{ display: 'flex', gap: 8}}>
					<button type='button' onClick={() => setSimulated(30)}>Show the modal (30s)</button>
					<button type='button' onClick={() => setSimulated(3)}>Show the modal (3s)</button>
				</div>
			</section>

			<section>
				<h3>Persistence</h3>
				<p>After reload the session will be updated with 'refresh' on mount</p>
				<button type='button' onClick={() => window.location.reload()}>Reload page</button>
			</section>

			<section>
				<h3>StorageService sanity</h3>
				<button
					type='button'
					onClick=
					{
						() => setResult
						(
							JSON.stringify
							(
								{
									access: truncate(storageService.getItem<string>(StorageKeys.ACCESS_TOKEN)),
									refresh: truncate(storageService.getItem<string>(StorageKeys.REFRESH_TOKEN)),
									userId: storageService.getItem<string>(StorageKeys.SESSION_USER_ID),
								},
								null, 4
							)
						)
					}
				>
					Read all auth keys
				</button>
			</section>

			{result && <pre style={{ padding: 12, background: '#1e1e1e', border: '1px solid #444', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result}</pre>}
			<IdleTimeoutModal isOpen={simulated !== null} secondsLeft={simulated ?? 0} onStay={async () => { setResult("I'm here"); setSimulated(null); }} onLogout={async () => { setResult("Logout"); setSimulated(null); }}/>
		</div>
	)
}



export { AuthTest };