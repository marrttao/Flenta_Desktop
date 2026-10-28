import { useState } from 'react';

import { useFormatters, useTranslation } from '../../../localization/index'
import { useDebouncedValue } from '../../../../hooks/useDevouncedValue';

import { useCrossRate } from '../../hooks/useCrossRate';

import { UserCurrency } from '../../../../typification';

import styles from './CrossRateCalculator.module.css';



interface CrossRateCalculatorProps
{
	rates: Record<string, number> | null;
	currencies: UserCurrency[];
	
	onBuyClick: (from: string, to: string, amount: number) => void;
}



function CrossRateCalculator({ rates, currencies, onBuyClick }: CrossRateCalculatorProps)
{
	const [amount, setAmount] = useState<number>(100);
	const [from, setFrom] = useState<string>('USD');
	const [to, setTo] = useState<string>('EUR');

	const debouncedAmount = useDebouncedValue(amount, 250);

	const { formatRate, formatAmount } = useFormatters();
	const { translate } = useTranslation();

	const result = useCrossRate(debouncedAmount, from, to, rates);
	const currencyOptions = (currencies.length > 0 )
		?
		currencies.map((currency) => currency.code)
		:
		(rates ? Object.keys(rates) : []);

	const handleSwapCurrencies = () =>
	{
		setFrom(to);
		setTo(from);
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>{translate('currency.calculator')}</h3>

			<div className={styles.row}>
				<input className={styles.amount_input} type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(parseFloat(event.target.value) || 0)}/>

				<select value={from} onChange={(event) => setFrom(event.target.value)}>
					{currencyOptions.map((code) => <option key={code} value={code}>{code}</option>)}
				</select>
				<button type="button" className={styles.swap_button} onClick={handleSwapCurrencies}/>
				<select value={to} onChange={(event) => setTo(event.target.value)}>
					{currencyOptions.map((code) => <option key={code} value={code}>{code}</option>)}
				</select>

				<span className={styles.result}>
					{result !== null ? formatAmount(result) : '-'}
				</span>
			</div>

			<p className={styles.hint}>
				{translate('currency.amount')}: {formatAmount(amount)} {from} to {result !== null ? formatAmount(result) : '-'} {to}
			</p>

			<button type="button" className={styles.buy_button} onClick={() => onBuyClick(from, to, amount)} disabled={result === null}>
				{translate('currency.buy')}
			</button>
		</div>
	);
}



export type { CrossRateCalculatorProps };

export { CrossRateCalculator };