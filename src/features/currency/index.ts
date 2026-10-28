export type { FrankfurterLatestResponse, CurrencyRate, OperationResult } from './types';
export type { UseCurrencyRatesResult } from './hooks/useCurrencyRates';
export type { UseUserCurrenciesResult } from './hooks/useUserCurrencies';

export { SPREAD, DEAFAULT_BASE_CURRENCY } from './utils/constants';

export { currencyRepository } from './api/currencyRepository';

export { useCurrencyRates } from './hooks/useCurrencyRates';
export { useUserCurrencies } from './hooks/useUserCurrencies';
export { useCrossRate } from './hooks/useCrossRate';

export { calculateCrossRate, applyBuySpread, applySellSpread } from './utils/crossRate';
export { fetchLatestRates, fetchCrossRate } from './api/frankfurterApi';



export type { Tab, TabsProps } from './components/Tabs/Tabs';
export type { CurrencyRateRowProps } from './components/CurrencyRateRow/CurrencyRateRow';
export type { CrossRateCalculatorProps } from './components/CrossRateCalculator/CrossRateCalculator';

export { Tabs } from './components/Tabs/Tabs';
export { CurrencyRateRow } from './components/CurrencyRateRow/CurrencyRateRow';
export { CrossRateCalculator } from './components/CrossRateCalculator/CrossRateCalculator';



export { CurrencyPage } from './pages/CurrencyPage/CurrencyPage';