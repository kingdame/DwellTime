/**
 * DwellTime Typography
 * Based on UI Design Document
 * Primary Font: Inter (with system fallbacks)
 */

import { Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter-Regular',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  medium: Platform.select({
    ios: 'Inter-Medium',
    android: 'Inter-Medium',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  semibold: Platform.select({
    ios: 'Inter-SemiBold',
    android: 'Inter-SemiBold',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  bold: Platform.select({
    ios: 'Inter-Bold',
    android: 'Inter-Bold',
    default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
};

// Consolidated typography object for easy imports
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Pre-composed text styles for common use cases
export const textStyles = {
  display: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
  },
  h1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
  },
  h2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  h3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
  },
} as const;
