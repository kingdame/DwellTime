/**
 * UI Store
 * Manages UI state (theme, modals, toasts, online status)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  toggleTheme: () => void;

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
  modalData: unknown;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // First launch (for onboarding video)
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

  // Facility detection prompt
  showFacilityPrompt: boolean;
  setShowFacilityPrompt: (show: boolean) => void;
}

// Generate unique ID for toasts
const generateId = () => Math.random().toString(36).substring(2, 11);

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark', // Default to dark mode for truckers (easier on eyes at night)
      isOnline: true,
      isSyncing: false,
      pendingSyncCount: 0,
      activeModal: null,
      modalData: null,
      toasts: [],
      hasSeenOnboarding: false,
      showFacilityPrompt: false,

      // Theme actions
      setTheme: (theme: ThemeMode) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Online status
      setOnline: (isOnline: boolean) => set({ isOnline }),

      // Sync status
      setSyncing: (isSyncing: boolean) => set({ isSyncing }),
      setPendingSyncCount: (pendingSyncCount: number) => set({ pendingSyncCount }),

      // Modal actions
      openModal: (modalId: string, data?: unknown) =>
        set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Toast actions
      showToast: (toast: Omit<ToastMessage, 'id'>) => {
        const id = generateId();
        const newToast: ToastMessage = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto-dismiss after duration (default 3 seconds)
        const duration = toast.duration ?? 3000;
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id);
          }, duration);
        }
      },
      dismissToast: (id: string) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),

      // Onboarding
      setHasSeenOnboarding: (hasSeenOnboarding: boolean) => set({ hasSeenOnboarding }),

      // Facility detection
      setShowFacilityPrompt: (showFacilityPrompt: boolean) => set({ showFacilityPrompt }),
    }),
    {
      name: 'dwelltime-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these values
        theme: state.theme,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);
