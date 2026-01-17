/**
 * Design Tokens - Premium UI System
 * 4px grid system with glass-morphism support
 */

// ============================================
// SPACING (4px grid)
// ============================================
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 48,
    timer: 56,
  },

  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
    timer: 4,
  },

  leading: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ============================================
// COLORS (Extended palette)
// ============================================
export const palette = {
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

  // Glass effect colors
  glass: {
    background: 'rgba(37, 37, 37, 0.75)',
    backgroundSolid: 'rgba(37, 37, 37, 0.95)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHighlight: 'rgba(255, 255, 255, 0.15)',
    innerGlow: 'rgba(255, 255, 255, 0.05)',
    innerGlowStrong: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

// ============================================
// GRADIENTS
// ============================================
export const gradients = {
  primary: ['#3B82F6', '#2563EB'] as const,
  primarySoft: ['#3B82F6', '#1D4ED8'] as const,
  success: ['#22C55E', '#16A34A'] as const,
  warning: ['#F97316', '#EA580C'] as const,
  danger: ['#F87171', '#EF4444'] as const,
  money: ['#22C55E', '#10B981'] as const,

  // Glass gradients
  glassHighlight: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)'] as const,
  glassBorder: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] as const,
  darkFade: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as const,

  // Glow gradients (for active states)
  primaryGlow: ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0)'] as const,
  successGlow: ['rgba(34,197,94,0.3)', 'rgba(34,197,94,0)'] as const,
} as const;

// ============================================
// SHADOWS / ELEVATION
// ============================================
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Color glow helper
export const createGlow = (color: string, opacity = 0.4) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: opacity,
  shadowRadius: 16,
  elevation: 0,
});

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// ============================================
// ANIMATION TIMING
// ============================================
export const animation = {
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Spring configs for Reanimated
  spring: {
    snappy: { damping: 20, stiffness: 300 },
    bouncy: { damping: 12, stiffness: 180 },
    gentle: { damping: 15, stiffness: 120 },
    slow: { damping: 20, stiffness: 80 },
  },
} as const;

// ============================================
// Z-INDEX
// ============================================
export const zIndex = {
  base: 0,
  card: 10,
  sticky: 100,
  overlay: 500,
  modal: 1000,
  toast: 2000,
  tooltip: 3000,
} as const;

// ============================================
// TOUCH TARGETS
// ============================================
export const touch = {
  minTarget: 44,
  comfortable: 48,
  large: 56,
} as const;
