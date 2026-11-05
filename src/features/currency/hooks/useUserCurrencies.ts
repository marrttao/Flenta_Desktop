import { useEffect, useState } from 'react';

import type { UserCurrency } from '../../../typification/';

import { storageService, StorageKeys } from '../../../storage/index';
import { isUserCurrencyList, reorderUserCurrencies } from '../utils/userCurrencies';



const DEFAULT_CURRENICIES: UserCurrency[] = [{ code: 'USD', order: 0 }, { code: 'EUR', order: 1 }];



interface UseUserCurrenciesResult
{
	currencies: UserCurrency[];
	
	addCurrency: (code: string) => void;
	removeCurrency: (code: string) => void;
	reorderCurrencies: (newOrder: string[]) => void;
}



function useUserCurrencies(): UseUserCurrenciesResult
{
	const [currencies, setCurrencies] = useState<UserCurrency[]>(() =>
	{
		const stored = storageService.getItem<unknown>(StorageKeys.USER_CURRENCY_LIST);
		return isUserCurrencyList(stored) ? stored : DEFAULT_CURRENICIES;
	});

	useEffect(() =>
	{
		storageService.setItem(StorageKeys.USER_CURRENCY_LIST, currencies);
	}, [currencies]);

	const addCurrency = (code: string) =>
	{
		if (!/^[A-Z]{3}$/.test(code)) { return; }
		setCurrencies
		(
			(previous) =>
			{
				if (previous.some((currency) => currency.code === code)) { return previous; }

				const newList = [...previous, { code, order: previous.length }];

				return newList;
			}
		);
	};
	const removeCurrency = (code: string) =>
	{
		setCurrencies
		(
			(previous) =>
			{
				const newList = previous.filter((currency) => currency.code !== code).map((currency, index) => ({ ...currency, order: index }));

				return newList;
			}
		);
	};
	const reorderCurrencies = (newOrder: string[]) =>
	{
		setCurrencies((previous) => reorderUserCurrencies(previous, newOrder));
	};

	return { currencies, addCurrency, removeCurrency, reorderCurrencies };
}


export type { UseUserCurrenciesResult };
export { useUserCurrencies };