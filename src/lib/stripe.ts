/**
 * Stripe Client Setup for React Native
 *
 * This module provides Stripe configuration and utilities for the DwellTime app.
 * Uses @stripe/stripe-react-native for native payment integration.
 */

import { Alert, Linking } from 'react-native';

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Merchant identifier for Apple Pay (iOS)
const APPLE_MERCHANT_ID = process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID || 'merchant.com.dwelltime.app';

/**
 * Check if Stripe is properly configured
 */
export const isStripeConfigured = (): boolean => {
  return Boolean(STRIPE_PUBLISHABLE_KEY);
};

/**
 * Get the Stripe publishable key
 */
export const getStripePublishableKey = (): string => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not found. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.');
    return '';
  }
  return STRIPE_PUBLISHABLE_KEY;
};

/**
 * Get the Apple Merchant ID for Apple Pay
 */
export const getAppleMerchantId = (): string => {
  return APPLE_MERCHANT_ID;
};

/**
 * Stripe Provider configuration for the app
 */
export const stripeProviderConfig = {
  publishableKey: getStripePublishableKey(),
  merchantIdentifier: getAppleMerchantId(),
  // Enable 3D Secure for additional security
  urlScheme: 'dwelltime',
};

/**
 * Open a Stripe checkout or portal URL
 * Falls back to in-app browser or system browser
 */
export const openStripeUrl = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'Unable to Open',
        'Could not open the payment page. Please try again later.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Error opening Stripe URL:', error);
    Alert.alert(
      'Error',
      'An error occurred while opening the payment page.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format price for subscription display (e.g., "$12.99/mo")
 */
export const formatSubscriptionPrice = (
  amount: number,
  interval: 'monthly' | 'annual',
  currency: string = 'USD'
): string => {
  const formattedAmount = formatCurrency(amount, currency);
  const intervalLabel = interval === 'monthly' ? '/mo' : '/yr';
  return `${formattedAmount}${intervalLabel}`;
};

/**
 * Calculate annual savings percentage
 */
export const calculateAnnualSavings = (
  monthlyPrice: number,
  annualPrice: number
): number => {
  const monthlyAnnualized = monthlyPrice * 12;
  const savings = ((monthlyAnnualized - annualPrice) / monthlyAnnualized) * 100;
  return Math.round(savings);
};

/**
 * Deep link handler for Stripe payment completion
 * Should be called when the app receives a deep link
 */
export const handleStripeDeepLink = (url: string): {
  success: boolean;
  sessionId?: string;
  canceled?: boolean;
} => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const sessionId = urlObj.searchParams.get('session_id');

    if (path.includes('/checkout/success')) {
      return { success: true, sessionId: sessionId || undefined };
    }

    if (path.includes('/checkout/cancel')) {
      return { success: false, canceled: true };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
};

/**
 * Validate a Stripe webhook signature (server-side only)
 * This is a placeholder - actual implementation should be in edge functions
 */
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
} as const;

export type StripeWebhookEventType = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS];
