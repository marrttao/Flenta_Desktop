import { useCallback, useEffect, useState } from 'react';

import type { FrankfurterLatestResponse  } from '../types';

import { DEAFAULT_BASE_CURRENCY } from '../utils/constants';

import { fetchLatestRates } from '../api/frankfurterApi';



interface UseCurrencyRatesResult
{
	data: FrankfurterLatestResponse | null;
	isLoading: boolean;
	error: string | null;
	
	refetchRates: () => void;
}



function useCurrencyRates(baseCurrency: string = DEAFAULT_BASE_CURRENCY): UseCurrencyRatesResult
{
	const [data, setData] = useState<FrankfurterLatestResponse | null>(null);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [reloadKey, setReloadKey] = useState<number>(0);

	useEffect
	(
		() =>
		{
			const controller = new AbortController();
			let active = true;

			setIsLoading(true);
			setError(null);

			fetchLatestRates(baseCurrency, controller.signal)
			.then
			(
				(response) =>
				{
					if (!active) { return; }

					setData(response);
				}
			)
			.catch
			(
				(error: unknown) =>
				{
					if (!active) { return; }
					if (error instanceof Error && error.name === 'AbortError') { return; }

					setError(error instanceof Error ? error.message : 'Unknown error');
				}
			)
			.finally
			(
				() =>
				{
					if (!active) { return; }

					setIsLoading(false);
				}
			)
		},
		[baseCurrency, reloadKey]
	);

	const refetchRates = useCallback(() => { setReloadKey(previousKey => previousKey + 1); }, []);

	return { data, isLoading, error, refetchRates };
}



export type { UseCurrencyRatesResult };

export { useCurrencyRates };