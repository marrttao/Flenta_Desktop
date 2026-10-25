import { useMemo } from 'react';

import { calculateCrossRate } from '../utils/crossRate';



function useCrossRate(amount: number, from: string, to: string, rates: Record<string, number> | null): number | null
{
	return useMemo
	(
		() =>
		{
			if (!rates || amount <= 0) { return null; }
			if (from === to) { return amount; }
			
			const rateFrom = rates[from];
			const rateTo = rates[to];
			if (rateFrom === undefined || rateTo === undefined) { return null; }

			return calculateCrossRate(amount, rateFrom, rateTo);
		},
		[amount, from, to, rates]
	);
}



export { useCrossRate };