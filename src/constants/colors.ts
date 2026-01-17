/**
 * DwellTime Color Palette
 * Extended with premium glass-morphism support
 */

export const colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FA',
    backgroundTertiary: '#F0F2F5',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textDisabled: '#9CA3AF',
    primary: '#1A56DB',
    primaryPressed: '#1648C0',
    primaryMuted: 'rgba(26, 86, 219, 0.1)',
    success: '#10B981',
    successMuted: 'rgba(16, 185, 129, 0.1)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    errorMuted: 'rgba(239, 68, 68, 0.1)',
    danger: '#EF4444',
    divider: '#E5E7EB',
    dividerLight: '#F3F4F6',
    cardShadow: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  dark: {
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#161616',
    card: '#252525',
    cardElevated: '#2A2A2A',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
    textTertiary: '#6B6B6B',
    textDisabled: '#4A4A4A',
    primary: '#3B82F6',
    primaryPressed: '#2563EB',
    primaryMuted: 'rgba(59, 130, 246, 0.15)',
    success: '#22C55E',
    successMuted: 'rgba(34, 197, 94, 0.15)',
    warning: '#F97316',
    warningMuted: 'rgba(249, 115, 22, 0.15)',
    error: '#F87171',
    errorMuted: 'rgba(248, 113, 113, 0.15)',
    danger: '#EF4444',
    divider: '#333333',
    dividerLight: '#2A2A2A',
    cardShadow: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  },

  // Semantic colors
  money: '#22C55E',
  moneyMuted: 'rgba(34, 197, 94, 0.15)',
  timer: '#3B82F6',
  timerMuted: 'rgba(59, 130, 246, 0.15)',
  detention: '#F97316',
  detentionMuted: 'rgba(249, 115, 22, 0.15)',
  danger: '#EF4444',

  // Glass effect colors
  glass: {
    background: 'rgba(37, 37, 37, 0.75)',
    backgroundSolid: 'rgba(37, 37, 37, 0.95)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHighlight: 'rgba(255, 255, 255, 0.15)',
    innerGlow: 'rgba(255, 255, 255, 0.05)',
    innerGlowStrong: 'rgba(255, 255, 255, 0.08)',
  },

  // Gradient definitions
  gradients: {
    primary: ['#3B82F6', '#2563EB'] as const,
    success: ['#22C55E', '#16A34A'] as const,
    warning: ['#F97316', '#EA580C'] as const,
    danger: ['#F87171', '#EF4444'] as const,
    money: ['#22C55E', '#10B981'] as const,
    glassHighlight: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)'] as const,
    glassBorder: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] as const,
    primaryGlow: ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0)'] as const,
    successGlow: ['rgba(34,197,94,0.3)', 'rgba(34,197,94,0)'] as const,
  },
} as const;

export type ColorScheme = typeof colors.light;
export type ThemeMode = 'light' | 'dark' | 'system';
