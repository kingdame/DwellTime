/**
 * DwellTime Color Palette
 */

export const colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FA',
    card: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    primary: '#1A56DB',
    primaryPressed: '#1648C0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    divider: '#E5E7EB',
    cardShadow: 'rgba(0,0,0,0.08)',
  },
  dark: {
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    card: '#252525',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
    textDisabled: '#6B6B6B',
    primary: '#3B82F6',
    primaryPressed: '#2563EB',
    success: '#22C55E',
    warning: '#F97316',
    error: '#F87171',
    divider: '#333333',
    cardShadow: 'transparent',
  },
  money: '#10B981',
  timer: '#1A56DB',
  detention: '#F59E0B',
  danger: '#EF4444',
} as const;

export type ColorScheme = typeof colors.light;
export type ThemeMode = 'light' | 'dark' | 'system';
