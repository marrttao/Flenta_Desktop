import { useEffect, useState } from 'react';



interface TokenExpiryResult
{
	expiresAt: number | null;
	msUntilExpiry: number | null;
}



function useTokenExpiry(expiresAt: number | null): TokenExpiryResult
{
	const [msUntilExpiry, setMsUntilExpiry] = useState<number | null>(null);

	useEffect
	(
		() =>
		{
			if (!expiresAt) { setMsUntilExpiry(null); return; }

			let timeoutId: ReturnType<typeof setTimeout> | null = null;

			const ms = () =>
			{
				const remaining = expiresAt - Date.now();
				setMsUntilExpiry(remaining);

				if (remaining < -60_000 && timeoutId !== null) { clearInterval(timeoutId); timeoutId = null; }
			};

			ms();
			timeoutId = setInterval(ms, 1_000);

			return () =>
			{
				if (timeoutId !== null) { clearInterval(timeoutId); }
			};
		},
		[expiresAt]
	);

	return { expiresAt: expiresAt, msUntilExpiry };
}



export type { TokenExpiryResult };

export { useTokenExpiry };