import Cookies from 'js-cookie';

import type { StorageAdapter } from '../types';



interface CookieAdapterOptions
{
	expiresInMinutes?: number;
	sameSite?: 'strict' | 'lax' | 'none';
	secure?: boolean;
	path?: string;
}



const DEFAULT_OPTIONS: CookieAdapterOptions =
{
	expiresInMinutes: 30,
	sameSite: 'strict',
	secure: true,
	path: '/'
}


class CookieAdapter implements StorageAdapter
{
	private readonly _options: Required<CookieAdapterOptions>;

	constructor(options: CookieAdapterOptions = {})
	{
		const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
		this._options =
		{
			expiresInMinutes: options.expiresInMinutes ?? DEFAULT_OPTIONS.expiresInMinutes,
			sameSite: options.sameSite ?? DEFAULT_OPTIONS.sameSite,
			secure: options.secure ?? isHttps,
			path: options.path ?? DEFAULT_OPTIONS.path,
		} as Required<CookieAdapterOptions>;
	}

	private _writeOptions(): Cookies.CookieAttributes
	{
		const attributes: Cookies.CookieAttributes =
		{
			sameSite: this._options.sameSite,
			secure: this._options.secure,
			path: this._options.path
		};

		if (this._options.expiresInMinutes > 0)
		{
			const expires = new Date();
			expires.setMinutes(expires.getMinutes() + this._options.expiresInMinutes);
			attributes.expires = expires;
		}

		return attributes;
	}

	private _removeOptions(): Cookies.CookieAttributes
	{
		return {
			sameSite: this._options.sameSite,
			secure: this._options.secure,
			path: this._options.path,
		};
	}

	getItem(key: string): string | null
	{
		try
		{
			if (typeof window === 'undefined') { return null; }

			const value = Cookies.get(key);
			return value !== undefined ? value : null;
		}
		catch (error)
		{
			console.warn(`[CookieAdapter.getItem()] Error getting item from cookies: ${key} - ${error}`);

			return null;
		}
	}
	setItem(key: string, value: string): void
	{
		try
		{
			if (typeof window === 'undefined') { return; }

			Cookies.set(key, value, this._writeOptions());
		}
		catch (error) { console.warn(`[CookieAdapter.setItem()] Error setting item in cookies: ${key} - ${error}`); }
	}
	removeItem(key: string): void
	{
		try
		{
			if (typeof window === 'undefined') { return; }

			Cookies.remove(key, this._removeOptions());
		}
		catch (error) { console.warn(`[CookieAdapter.removeItem()] Error removing item from cookies: ${key} - ${error}`); }
	}

	clear(): void
	{
		try
		{
			if (typeof window === 'undefined') { return; }

			const allCookies = Cookies.get();
			for (const key of Object.keys(allCookies)) { Cookies.remove(key, this._removeOptions()); }
		}
		catch (error) { console.warn(`[CookieAdapter.clear()] Error clearing cookies: ${error}`); }	
	}
}



export type { CookieAdapterOptions };

export { CookieAdapter };