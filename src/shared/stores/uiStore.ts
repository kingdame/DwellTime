/**
 * UI Store
 * Manages UI state (theme, modals, toasts, online status)
 * Will be implemented when Zustand is installed
 */

import type { ThemeMode } from '@/constants';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Online status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Sync status
  isSyncing: boolean;
  setSyncing: (syncing: boolean) => void;
  pendingSyncCount: number;
  setPendingSyncCount: (count: number) => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // First launch (for onboarding)
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
}

// TODO: Implement with Zustand
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// export const useUIStore = create<UIState>()(
//   persist(
//     (set, get) => ({
//       theme: 'dark', // Default to dark mode for truckers
//       isOnline: true,
//       isSyncing: false,
//       pendingSyncCount: 0,
//       activeModal: null,
//       toasts: [],
//       hasSeenOnboarding: false,
//       // ... implementation
//     }),
//     {
//       name: 'dwelltime-ui',
//       storage: createJSONStorage(() => AsyncStorage),
//       partialize: (state) => ({
//         theme: state.theme,
//         hasSeenOnboarding: state.hasSeenOnboarding,
//       }),
//     }
//   )
// );
