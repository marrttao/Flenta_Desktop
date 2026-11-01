import { useState } from 'react';

import { apiRequest, ApiError } from '../../../../features/auth/api/httpClient';



type Outcome = 'healthy' | 'unreachable' | 'server_error' | 'client_error';

interface ProbeResult
{
	outcome: Outcome;
	elapsedMs: number;
	status: number | null;
	body: unknown;
	error: string | null;
	code: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '(not set in VITE_API_BASE_URL)';



async function probeStatus(): Promise<ProbeResult>
{
	const started = Date.now();
	try
	{
		const body = await apiRequest<{ service: string; status: string; timestamp: string }>('/api/status');
		return { outcome: 'healthy', elapsedMs: Date.now() - started, status: 200, body, error: null, code: null };
	}
	catch (error: unknown)
	{
		const elapsedMs = Date.now() - started;

		if (error instanceof ApiError)
		{
			if (error.status === 0) { return { outcome: 'unreachable', elapsedMs, status: 0, body: null, error: error.message, code: null }; }
			return { outcome: 'server_error', elapsedMs, status: error.status, body: null, error: error.message, code: error.code ?? null };
		}
		return { outcome: 'client_error', elapsedMs, status: null, body: null, error: error instanceof Error ? error.message : 'Unknown error', code: null };
	}
}



function OutcomeBadge({ outcome }: { outcome: Outcome })
{
	const label = outcome === 'healthy' ? 'Health: OK'
		: outcome === 'unreachable' ? 'No connection'
		: outcome === 'server_error' ? 'Server responded with an error'
		: 'Client error';

	const color = outcome === 'healthy' ? '#16a34a'
		: outcome === 'server_error' ? '#d97706'
		: '#dc2626';

	return <strong style={{ color }}>{label}</strong>;
}



function BackendHealthApiTest()
{
	const [result, setResult] = useState<ProbeResult | null>(null);
	const [busy, setBusy] = useState(false);

	async function check()
	{
		setBusy(true);
		setResult(null);
		
		try { setResult(await probeStatus()); }
		finally { setBusy(false); }
	}

	return (
		<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
			<h1>Backend Health API Test</h1>

			<section>
				<h3>Configuration</h3>
				<p>VITE_API_BASE_URL: <code>{API_BASE_URL}</code></p>
				<p>The check goes through <code>GET /api/status</code></p>
			</section>

			<section>
				<h3>Probe</h3>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<button type="button" onClick={check} disabled={busy}>{busy ? 'Checking…' : 'Check backend'}</button>
					{result && <OutcomeBadge outcome={result.outcome}/>}
				</div>
			</section>

			{
				result &&
				(
					<section>
						<h3>Result</h3>
						<ul>
							<li>Outcome: <code>{result.outcome}</code></li>
							<li>HTTP status: <code>{result.status ?? '—'}</code></li>
							<li>Elapsed: <code>{result.elapsedMs} ms</code></li>

							{result.code && <li>Error code: <code>{result.code}</code></li>}
							{result.error && <li>Error: <code>{result.error}</code></li>}
						</ul>
						
						{
							result.body !== null &&
							(
								<pre style={{ padding: 12, background: '#1e1e1e', border: '1px solid #444', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(result.body, null, 2)}</pre>
							)
						}
					</section>
				)
			}
		</div>
	);
}



export { BackendHealthApiTest };