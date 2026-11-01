import type { StorageAdapter } from '../types';



class LocalStorageAdapter implements StorageAdapter
{
	getItem(key: string): string | null
	{
		try
		{
			if (typeof window === 'undefined' || !window.localStorage) { return null; }
			
			return window.localStorage.getItem(key);
		}
		catch (error)
		{
			console.warn(`[LocalStorageAdapter.getItem()] Error getting item from localStorage: ${key} - ${error}`);

			return null;
		}
	}
	setItem(key: string, value: string): void
	{
		try
		{
			if (typeof window === 'undefined' || !window.localStorage) { return; }
			
			window.localStorage.setItem(key, value);
		}
		catch (error) { console.warn(`[LocalStorageAdapter.setItem()] Error setting item in localStorage: ${key} - ${error}`); }
	}
	removeItem(key: string): void
	{
		try
		{
			if (typeof window === 'undefined' || !window.localStorage) { return; }
			
			window.localStorage.removeItem(key);
		}
		catch (error) { console.warn(`[LocalStorageAdapter.removeItem()] Error removing item from localStorage: ${key} - ${error}`); }
	}

	clear(): void
	{
		try
		{
			if (typeof window === 'undefined' || !window.localStorage) { return; }
			
			window.localStorage.clear();
		}
		catch (error) { console.warn(`[LocalStorageAdapter.clear()] Error clearing localStorage: ${error}`); }
	}
}



export { LocalStorageAdapter };