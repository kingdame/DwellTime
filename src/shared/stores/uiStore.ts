/**
 * UI Store - Global UI state management
 */

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  theme: ThemeMode;
  isOnline: boolean;
  setTheme: (theme: ThemeMode) => void;
  setOnline: (online: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  isOnline: true,
  setTheme: (theme) => set({ theme }),
  setOnline: (isOnline) => set({ isOnline }),
}));
