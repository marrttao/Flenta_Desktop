export type { StorageServiceOptions } from './services/storageService';
export type { StorageAdapter } from './adapters/types';
export type { CookieAdapterOptions } from './adapters/types/CookieAdapter';

export { storageService, StorageService } from './services/storageService';

export { SENSITIVE_KEYS, NON_SENSITIVE_KEYS } from './utils/policy';
export { StorageKeys } from './keys';

export { LocalStorageAdapter } from './adapters/types/LocalStorageAdapter';
export { CookieAdapter } from './adapters/types/CookieAdapter';
export { MemoryAdapter } from './adapters/types/MemoryAdapter';

export { isSensitiveKey } from './utils/policy';