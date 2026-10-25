import type { StorageAdapter } from '../types';



class MemoryAdapter implements StorageAdapter
{
	private readonly _storage: Map<string, string>;

	constructor() { this._storage = new Map<string, string>(); }

	getItem(key: string): string | null { return this._storage.get(key) ?? null; }
	setItem(key: string, value: string): void { this._storage.set(key, value); }
	removeItem(key: string): void { this._storage.delete(key); }
	
	clear(): void { this._storage.clear(); }
}



export { MemoryAdapter };