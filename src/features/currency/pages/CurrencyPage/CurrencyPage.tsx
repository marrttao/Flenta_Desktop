import { useMemo, useState } from 'react';

import { useFormatters, useTranslation } from '../../../localization/index';
import { useToast } from '../../../../components/ui/Toast/index';

import { Loader } from '../../../../components/ui/Loader/index';
import { ConfirmModal } from '../../../../components/ui/Modals/ConfirmModal/index';

import { useCurrencyRates } from '../../hooks/useCurrencyRates';
import { useUserCurrencies  } from '../../hooks/useUserCurrencies';

import { currencyRepository } from '../../api/currencyRepository';

import { Tabs } from '../../components/Tabs/Tabs';
import { CurrencyRateRow } from '../../components/CurrencyRateRow/CurrencyRateRow';
import { CrossRateCalculator } from '../../components/CrossRateCalculator/CrossRateCalculator';

import styles from './CurrencyPage.module.css';



interface TradeRequest
{
	action: 'buy' | 'sell';
	code: string;
	amount: number;
}



function CurrencyPage()
{
	const { data, isLoading, error, refetchRates } = useCurrencyRates('USD');
	const { currencies, addCurrency, removeCurrency } = useUserCurrencies();

	const [tradeRequest, setTradeRequest] = useState<TradeRequest | null>(null);
	const [isTrading, setIsTrading] = useState<boolean>(false);

	const toast = useToast();
	const { translate } = useTranslation();
	const { formatDate, formatAmount } = useFormatters();

	const [activeTab, setActiveTab] = useState<string>('rates');

	const rates = useMemo<Record<string, number> | null>
	(
		() => (data ? { ...data.rates, [data.base] : 1 } : null),
		[data]
	);

	const allCurrencies = rates ? Object.keys(rates).sort() : [];



	const handleRowBuyClick = (code: string) => { setTradeRequest({ action: 'buy', code: code, amount: 1 }); }
	const handleCalculatorBuyClick = (from: string, to: string, amount: number) => { setTradeRequest({ action: 'buy', code: to, amount: amount }); }

	const handleConfirmTrade = async () =>
	{
		if (!tradeRequest) { return; }

		setIsTrading(true);

		try
		{
			const response = tradeRequest.action === 'buy'
				?
				await currencyRepository.buyCurrency(tradeRequest.code, tradeRequest.amount)
				:
				await currencyRepository.sellCurrency(tradeRequest.code, tradeRequest.amount);

			if (response.success) { toast.showToast({ type: 'success', title: translate('currency.operationSuccess') }); }
		}
		catch (error: unknown) { toast.showToast({ type: 'error', title: translate('currency.error'), message: error instanceof Error ? error.message : 'Unknown error' }); }
		finally
		{
			setIsTrading(false);
			setTradeRequest(null);
		}
	};

	if (isLoading)
	{
		return (
			<div className={styles.loader_container}>
				<Loader size="large" label={translate('currency.loading')}/>
			</div>
		);
	}

	if (error)
	{
		return (
			<div className={styles.error_container}>
				<p className={styles.error_message}>{translate('currency.error')}: {error}</p>
				<button type="button" className={styles.retry_button} onClick={refetchRates}>{translate('currency.retry')}</button>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>{translate('currency.title')}</h1>

			{ data?.date && <p className={styles.as_of_date}>{translate('currency.asOf')}: {formatDate(data.date)}</p> }	

			<Tabs
				tabs=
				{
					[
						{ key: 'rates', label: translate('currency.rates') },
						{ key: 'user', label: translate('currency.myList') }
					]
				}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			{
				activeTab === 'rates' &&
				(
					<table className={styles.rates_table}>
						<thead>
							<tr className={styles.rates_table_header}>
								<th className={styles.rates_table_header_cell}>{translate('currency.currency')}</th>
								<th className={styles.rates_table_header_cell}>{translate('currency.buy')}</th>
								<th className={styles.rates_table_header_cell}>{translate('currency.sell')}</th>
							</tr>
						</thead>

						<tbody>
							{allCurrencies.map((code) => <CurrencyRateRow key={code} code={code} rate={rates ? rates[code] : 0} onBuyClick={handleRowBuyClick}/>)}
						</tbody>
					</table>
				)
			}
			{
				activeTab === 'user' &&
				(
					<div>
						<div className={styles.user_currencies_container}>
							{
								currencies.map
								(
									(currency) =>
									(
										<div key={currency.code} className={styles.user_currency_row}>
											<span>{currency.code}</span>
											<button type="button" onClick={() => removeCurrency(currency.code)}>{translate('currency.remove')}</button>
										</div>
									)
								)
							}
						</div>

						<select onChange={(event) => { if (event.target.value) { addCurrency(event.target.value); event.target.value = ''; } }} defaultValue="">
							<option value="" disabled>{translate('currency.addCurrency')}</option>
							{
								allCurrencies.filter((code) => !currencies.some((currency) => currency.code === code)).map((code) => <option key={code} value={code}>{code}</option>)
							}
						</select>
					</div>
				)
			}

			<CrossRateCalculator rates={rates} onBuyClick={handleCalculatorBuyClick}/>

			<ConfirmModal
				isOpen={tradeRequest !== null}
				
				onClose={() => { setTradeRequest(null); }}
				onConfirm={handleConfirmTrade}

				title={translate('currency.confirmOperation')}
				message=
				{
					tradeRequest
						?
						`${translate(`currency.${tradeRequest.action}`)} ${formatAmount(tradeRequest.amount)} ${tradeRequest.code}?`
						:
						''
				}

				confirmText={translate('currency.buy')}
				cancelText={translate('currency.cancel')}

				variant="primary"
				loading={isTrading}
			/>
		</div>
	);
}



export { CurrencyPage };