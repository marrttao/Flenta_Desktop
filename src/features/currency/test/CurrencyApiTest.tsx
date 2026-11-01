import { useState } from 'react';

import { FrankfurterLatestResponse } from '../types';

import { fetchLatestRates } from '../api/frankfurterApi';



function CurrencyApiTest()
{
	const [data, setData] = useState<FrankfurterLatestResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);



	const handleLoad = async () =>
	{
		setIsLoading(true);
		setError(null);

		try
		{
			const response = await fetchLatestRates('USD');
			setData(response);
		}
		catch (error: unknown) { setError(error instanceof Error ? error : new Error('An unknown error occurred')); }
		finally { setIsLoading(false); }
	}

	return (
		<div>
			<h1>Frankfurter API</h1>

			<button type="button" onClick={handleLoad} disabled={isLoading}>{isLoading ? 'Loading...' : 'Load Latest Rates'}</button>

			{error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
			{
				data &&
				(
					<div style={{ padding: 12, background: '#1e1e1e', borderRadius: 6, overflow: 'auto' }}>
						{JSON.stringify(data, null, 2)}
					</div>
				)
			}
		</div>
	);
}



export { CurrencyApiTest };