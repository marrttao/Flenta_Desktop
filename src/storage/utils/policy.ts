import { StorageKeys } from '../keys';



const SENSITIVE_KEYS: ReadonlySet<StorageKeys> = new Set
(
	[
		// StorageKeys.FOR_TEST_SENSITIVE_1,
		// StorageKeys.FOR_TEST_SENSITIVE_2,
	]	
);

const NON_SENSITIVE_KEYS: ReadonlySet<StorageKeys> = new Set
(
	[
		// StorageKeys.FOR_TEST_NON_SENSITIVE_1,
		// StorageKeys.FOR_TEST_NON_SENSITIVE_2,

		StorageKeys.USER_CURRENCY_LIST,
		StorageKeys.THEM,
	]
);



function isSensitiveKey(key: StorageKeys): boolean { return SENSITIVE_KEYS.has(key); }


export { SENSITIVE_KEYS, NON_SENSITIVE_KEYS };

export { isSensitiveKey };