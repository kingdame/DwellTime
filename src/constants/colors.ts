/**
 * DwellTime Color Palette
 * Based on UI Design Document - Clean Trust aesthetic
 */

export const colors = {
  // Light Mode
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FA',
    card: '#FFFFFF',

    // Text
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',

    // Accent
    primary: '#1A56DB',
    primaryPressed: '#1648C0',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Utility
    divider: '#E5E7EB',
    cardShadow: 'rgba(0,0,0,0.08)',
  },

  // Dark Mode
  dark: {
    // Backgrounds
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    card: '#252525',

    // Text
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
    textDisabled: '#6B6B6B',

    // Accent
    primary: '#3B82F6',
    primaryPressed: '#2563EB',

    // Status
    success: '#22C55E',
    warning: '#F97316',
    error: '#F87171',

    // Utility
    divider: '#333333',
    cardShadow: 'transparent',
  },

  // Semantic colors (shared)
  money: '#10B981', // Green for earnings
  timer: '#1A56DB', // Blue for active timer
  detention: '#F59E0B', // Amber for detention warning
  danger: '#EF4444', // Red for destructive actions
} as const;

export type ColorScheme = typeof colors.light;
export type ThemeMode = 'light' | 'dark' | 'system';
