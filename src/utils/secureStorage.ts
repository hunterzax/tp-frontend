// CWE-922 Fix: Secure Storage Utility
// This utility provides a more secure way to handle sensitive data storage
"use client";

import { encryptData, decryptData } from './encryptionData';

/**
 * SecureStorage provides encrypted storage with additional security measures
 * for handling sensitive information like tokens, user data, etc.
 */

interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // expiration time in milliseconds
}

interface StorageItem {
  value: any;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
}

class SecureStorageManager {
  private storage: Storage;
  private memoryCache: Map<string, any>;

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'sessionStorage') {
    // Use sessionStorage by default for better security (data cleared when tab closes)
    this.storage = typeof window !== 'undefined'
      ? (storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage)
      : {} as Storage;
    this.memoryCache = new Map();
  }

  /**
   * Set item in storage with encryption and optional expiration
   */
  setItem(key: string, value: any, options: StorageOptions = { encrypt: true }): void {
    try {
      const storageItem: StorageItem = {
        value: options.encrypt ? encryptData(value) : value,
        encrypted: options.encrypt || false,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined
      };

      this.storage.setItem(key, JSON.stringify(storageItem));

      // Also cache in memory for performance
      this.memoryCache.set(key, value);
    } catch (error) {
      console.error('SecureStorage: Error setting item', error);
      // Fallback to memory cache only
      this.memoryCache.set(key, value);
    }
  }

  /**
   * Get item from storage with automatic decryption
   */
  getItem(key: string): any {
    try {
      // Check memory cache first
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key);
      }

      const item = this.storage.getItem(key);
      if (!item) return null;

      const storageItem: StorageItem = JSON.parse(item);

      // Check expiration
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.removeItem(key);
        return null;
      }

      let value = storageItem.encrypted
        ? decryptData(storageItem.value)
        : storageItem.value;

      // Try to parse if it's a JSON string
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      // Update memory cache
      this.memoryCache.set(key, value);

      return value;
    } catch (error) {
      console.error('SecureStorage: Error getting item', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
      this.memoryCache.delete(key);
    } catch (error) {
      console.error('SecureStorage: Error removing item', error);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      this.storage.clear();
      this.memoryCache.clear();
    } catch (error) {
      console.error('SecureStorage: Error clearing storage', error);
    }
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string): boolean {
    return this.memoryCache.has(key) || this.storage.getItem(key) !== null;
  }
}

// Create instances for different use cases
// Use sessionStorage for highly sensitive data (tokens, credentials)
export const secureSessionStorage = new SecureStorageManager('sessionStorage');

// Use localStorage for less sensitive data that needs persistence
export const secureLocalStorage = new SecureStorageManager('localStorage');

// Memory-only storage for most sensitive data (cleared on page reload)
class MemoryStorage {
  private data: Map<string, any>;

  constructor() {
    this.data = new Map();
  }

  setItem(key: string, value: any): void {
    this.data.set(key, value);
  }

  getItem(key: string): any {
    return this.data.get(key);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  hasItem(key: string): boolean {
    return this.data.has(key);
  }
}

export const memoryStorage = new MemoryStorage();

// Legacy support: Wrapper functions for backward compatibility
export const setSecureItem = (key: string, value: any, usePersistent = false) => {
  if (usePersistent) {
    secureLocalStorage.setItem(key, value, { encrypt: true });
  } else {
    secureSessionStorage.setItem(key, value, { encrypt: true });
  }
};

export const getSecureItem = (key: string, usePersistent = false) => {
  if (usePersistent) {
    return secureLocalStorage.getItem(key);
  }
  return secureSessionStorage.getItem(key);
};

export const removeSecureItem = (key: string, usePersistent = false) => {
  if (usePersistent) {
    secureLocalStorage.removeItem(key);
  } else {
    secureSessionStorage.removeItem(key);
  }
};

const secureStorageResult = {
  secureSessionStorage,
  secureLocalStorage,
  memoryStorage,
  setSecureItem,
  getSecureItem,
  removeSecureItem
};

export default secureStorageResult;

