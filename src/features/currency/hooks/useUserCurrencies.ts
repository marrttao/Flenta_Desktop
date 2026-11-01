import { useState } from 'react';

import type { UserCurrency } from '../../../typification/';

import { storageService, StorageKeys } from '../../../storage/index';



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
	const [currencies, setCurrencies] = useState<UserCurrency[]>(() => storageService.getItem<UserCurrency[]>(StorageKeys.USER_CURRENCY_LIST) ?? DEFAULT_CURRENICIES);

	const _listBeforeChange = (list: UserCurrency[]) =>
	{
		storageService.setItem(StorageKeys.USER_CURRENCY_LIST, list);
		setCurrencies(list);
	}

	const addCurrency = (code: string) =>
	{
		setCurrencies
		(
			(previous) =>
			{
				if (previous.some((currency) => currency.code === code)) { return previous; }

				const newList = [...previous, { code, order: previous.length }];
				_listBeforeChange(newList);

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
				_listBeforeChange(newList);

				return newList;
			}
		);
	};
	const reorderCurrencies = (newOrder: string[]) =>
	{
		setCurrencies
		(
			(previous) =>
			{
				const map = new Map(previous.map((currency) => [currency.code, currency]));
				const newList = newOrder.map
				(
					(code, index) =>
					{
						const item = map.get(code);
						return item ? { ...item, order: index } : null;
					}
				)
				.filter((item): item is UserCurrency => item !== null);
				_listBeforeChange(newList);
				
				return newList;
			}
		);
	};

	return { currencies, addCurrency, removeCurrency, reorderCurrencies };
}


export type { UseUserCurrenciesResult };
export { useUserCurrencies };