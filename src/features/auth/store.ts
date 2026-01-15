/**
 * Auth Store - Authentication state management
 * Works alongside Clerk for additional app-level auth state
 */

import { create } from 'zustand';

interface AuthState {
  // User profile from our database (separate from Clerk user)
  userProfile: {
    id: string;
    email: string;
    name?: string;
    companyName?: string;
    subscriptionTier: string;
  } | null;
  isLoading: boolean;
  
  // Actions
  setUserProfile: (profile: AuthState['userProfile']) => void;
  setLoading: (loading: boolean) => void;
  clearUserProfile: () => void;
}

/**
 * Auth store for app-level user state
 * Note: Primary auth is handled by Clerk. This store is for:
 * - Caching user profile data from our database
 * - Managing loading states during profile fetches
 */
export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  isLoading: false,

  setUserProfile: (userProfile) => set({ userProfile }),
  
  setLoading: (isLoading) => set({ isLoading }),

  clearUserProfile: () => set({ userProfile: null }),
}));
