import { useFormatters, useTranslation  } from '../../../../features/localization/index';

import { applyBuySpread, applySellSpread } from '../../utils/crossRate';



interface CurrencyRateRowProps
{
	code: string;
	rate: number;

	onBuyClick: (code: string) => void;
}



function CurrencyRateRow({ code, rate, onBuyClick }: CurrencyRateRowProps)
{
	const { formatRate } = useFormatters();
	const { translate } = useTranslation();

	const buyRate = applyBuySpread(rate);
	const sellRate = applySellSpread(rate);

	return (
		<tr>
			<td className="currency-code">{code}</td>
			<td className="currency-rate">{formatRate(buyRate)}</td>
			<td className="currency-rate">{formatRate(sellRate)}</td>
			<td className="currency-action">
				<button type="button" onClick={() => onBuyClick(code)}>{translate('currency.buy')}</button>
			</td>
		</tr>
	);
}



export type { CurrencyRateRowProps };

export { CurrencyRateRow };