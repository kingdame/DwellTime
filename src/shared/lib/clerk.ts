/**
 * Clerk Token Cache Configuration
 * Securely stores Clerk authentication tokens using expo-secure-store
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenCache } from '@clerk/clerk-expo';

/**
 * Create a key for SecureStore that's valid across platforms
 * SecureStore keys can only contain alphanumeric characters, '.', '-', and '_'
 */
const createSecureKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Token cache implementation for Clerk
 * Uses SecureStore on native platforms, falls back to memory on web
 */
export const tokenCache: TokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      // Web doesn't support SecureStore
      if (Platform.OS === 'web') {
        return null;
      }

      const secureKey = createSecureKey(key);
      const value = await SecureStore.getItemAsync(secureKey);
      return value;
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
      return null;
    }
  },

  async saveToken(key: string, value: string): Promise<void> {
    try {
      // Web doesn't support SecureStore
      if (Platform.OS === 'web') {
        return;
      }

      const secureKey = createSecureKey(key);
      await SecureStore.setItemAsync(secureKey, value);
    } catch (error) {
      console.error('Error saving token to SecureStore:', error);
    }
  },

  async clearToken(key: string): Promise<void> {
    try {
      // Web doesn't support SecureStore
      if (Platform.OS === 'web') {
        return;
      }

      const secureKey = createSecureKey(key);
      await SecureStore.deleteItemAsync(secureKey);
    } catch (error) {
      console.error('Error clearing token from SecureStore:', error);
    }
  },
};

/**
 * Clerk publishable key from environment
 */
export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Check if Clerk is properly configured
 */
export const isClerkConfigured = (): boolean => {
  return Boolean(clerkPublishableKey);
};
