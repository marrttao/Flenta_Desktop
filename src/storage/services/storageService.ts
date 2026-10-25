import type { StorageAdapter } from '../adapters/index';
import { LocalStorageAdapter, CookieAdapter } from '../adapters/index';
import { StorageKeys } from '../keys';

import { NON_SENSITIVE_KEYS, SENSITIVE_KEYS } from '../utils/policy';
import { isSensitiveKey } from '../utils/policy';



interface StorageServiceOptions
{
	sensitive?: StorageAdapter;
	nonSensitive?: StorageAdapter;
}



class StorageService
{
	private readonly _sensitiveAdapter: StorageAdapter;
	private readonly _nonSensitiveAdapter: StorageAdapter;

	constructor(options: StorageServiceOptions = {})
	{
		this._sensitiveAdapter = options.sensitive ?? new CookieAdapter();
		this._nonSensitiveAdapter = options.nonSensitive ?? new LocalStorageAdapter();
	}

	private _adapterForKey(key: StorageKeys): StorageAdapter { return isSensitiveKey(key) ? this._sensitiveAdapter : this._nonSensitiveAdapter; }

	getItem<Type>(key: StorageKeys, typeName?: string): Type | null
	{
		const rawValue = this._adapterForKey(key).getItem(key);
		if (rawValue === null) { return null; }
		
		try { return JSON.parse(rawValue) as Type; }
		catch (error)
		{
			const name = typeName ?? 'unknown';
			console.warn(`[StorageService.get<${name ?? 'unknown'}>]Failed to parse value: ${key} - ${error}`);

			return null;
		}
	}
	setItem<Type>(key: StorageKeys, value: Type): void
	{
		try
		{
			const rawValue = JSON.stringify(value);
			this._adapterForKey(key).setItem(key, rawValue);
		}
		catch (error) { console.warn(`[StorageService.set<${typeof value}>]Failed to stringify value: ${key} - ${error}`); }
	}
	removeItem(key: StorageKeys): void { this._adapterForKey(key).removeItem(key); }

	clearSensitive(): void
	{
		for (const key of SENSITIVE_KEYS) { this._sensitiveAdapter.removeItem(key); }
	}
	clearNonSensitive(): void
	{
		for (const key of NON_SENSITIVE_KEYS) { this._nonSensitiveAdapter.removeItem(key); }
	}
	clearAll(): void
	{
		this.clearSensitive();
		this.clearNonSensitive();
	}
}



export type { StorageServiceOptions };

export const storageService = new StorageService();
export { StorageService };