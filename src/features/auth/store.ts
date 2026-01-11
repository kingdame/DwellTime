/**
 * Auth Store - Authentication state management
 */

import { create } from 'zustand';

interface AuthState {
  session: any | null;
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: any | null) => void;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setSession: (session) =>
    set({
      session,
      isAuthenticated: !!session,
    }),

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  refreshSession: async () => {
    // Placeholder - implement with supabase
    set({ isLoading: false });
  },

  signOut: async () => {
    set({
      session: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
