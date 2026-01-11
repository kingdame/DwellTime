/**
 * Auth Store
 * Manages authentication state using Zustand
 * Will be implemented when Zustand is installed
 */

import type { User } from '@/shared/types';

// Placeholder interface
export interface AuthState {
  user: User | null;
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// TODO: Implement with Zustand
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       session: null,
//       isLoading: true,
//       isAuthenticated: false,
//       // ... implementation
//     }),
//     {
//       name: 'dwelltime-auth',
//       storage: createJSONStorage(() => AsyncStorage),
//     }
//   )
// );
