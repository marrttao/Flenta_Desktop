const SPREAD_ENV_RAW = parseFloat(import.meta.env.VITE_CURRENCY_SPREAD ?? '');
const SPREAD = Number.isFinite(SPREAD_ENV_RAW) ? SPREAD_ENV_RAW : 0.005;

const DEAFAULT_BASE_CURRENCY = 'USD';



export { SPREAD, DEAFAULT_BASE_CURRENCY };