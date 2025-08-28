// src/utils/secureStorage.ts
import * as SecureStore from 'expo-secure-store';
import type { Storage } from 'redux-persist';

// Helper function to sanitize keys for SecureStore
const sanitizeKey = (key: string): string => {
  // Remove or replace invalid characters
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const SecureStorage: Storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      throw new Error(
        'Invalid key provided to SecureStore. Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".'
      );
    }
    await SecureStore.setItemAsync(sanitizedKey, value);
  },
  getItem: async (key: string): Promise<string | null> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      return null;
    }
    return await SecureStore.getItemAsync(sanitizedKey);
  },
  removeItem: async (key: string): Promise<void> => {
    const sanitizedKey = sanitizeKey(key);
    if (!sanitizedKey) {
      return;
    }
    await SecureStore.deleteItemAsync(sanitizedKey);
  },
};

export default SecureStorage;
