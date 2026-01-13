/**
 * DwellTime Subscription Hooks
 *
 * React hooks for subscription management, checkout, and billing state.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  getSubscriptionStatus,
  createCheckoutSession,
  openCheckout,
  openCustomerPortal,
  getPricingPlans,
  getPricingPlan,
  getSubscriptionFeatures,
  getRemainingEvents,
  isSubscriptionActive,
  getTrialDaysRemaining,
} from '../services/billingService';
import type {
  SubscriptionTier,
  SubscriptionInfo,
  BillingInterval,
  PricingPlan,
  SubscriptionFeatures,
} from '../types';

// Query keys
export const subscriptionKeys = {
  all: ['subscription'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  remaining: () => [...subscriptionKeys.all, 'remaining'] as const,
};

/**
 * Hook for current subscription state
 */
export function useSubscription() {
  const query = useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: getSubscriptionStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });

  const subscription = query.data;
  const features = subscription ? getSubscriptionFeatures(subscription.tier) : null;
  const trialDaysRemaining = subscription?.trialEnd
    ? getTrialDaysRemaining(subscription.trialEnd)
    : null;

  return {
    // Query state
    subscription,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Computed values
    tier: subscription?.tier ?? 'free',
    status: subscription?.status ?? 'active',
    isActive: subscription ? isSubscriptionActive(subscription.status) : true,
    isTrialing: subscription?.status === 'trialing',
    isCanceled: subscription?.cancelAtPeriodEnd ?? false,
    trialDaysRemaining,
    features,

    // Plan info
    currentPlan: subscription ? getPricingPlan(subscription.tier) : getPricingPlan('free'),
    periodEnd: subscription?.currentPeriodEnd,
  };
}

/**
 * Hook for remaining events (free tier)
 */
export function useRemainingEvents() {
  return useQuery({
    queryKey: subscriptionKeys.remaining(),
    queryFn: getRemainingEvents,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for available pricing plans
 */
export function usePricingPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => getPricingPlans(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook for creating a checkout session
 */
export function useCheckout(tier: Exclude<SubscriptionTier, 'free' | 'enterprise'>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ interval }: { interval: BillingInterval }) =>
      createCheckoutSession(tier, interval),
    onSuccess: async (data) => {
      // Open the checkout URL
      const { url } = data;
      if (url) {
        const opened = await openCheckout(tier, 'monthly'); // Just for opening, tier/interval already in session
        if (!opened) {
          Alert.alert(
            'Unable to Open Checkout',
            'Please try again or contact support if the issue persists.'
          );
        }
      }
    },
    onError: (error: Error) => {
      Alert.alert(
        'Checkout Error',
        error.message || 'Failed to create checkout session. Please try again.'
      );
    },
  });

  return {
    checkout: (interval: BillingInterval) => mutation.mutate({ interval }),
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for opening customer portal
 */
export function useCustomerPortal() {
  const mutation = useMutation({
    mutationFn: openCustomerPortal,
    onError: (error: Error) => {
      Alert.alert(
        'Portal Error',
        error.message || 'Failed to open customer portal. Please try again.'
      );
    },
  });

  return {
    openPortal: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for subscription feature checks
 */
export function useSubscriptionFeature(feature: keyof SubscriptionFeatures) {
  const { subscription, features } = useSubscription();

  if (!features) {
    return { hasFeature: false, value: null };
  }

  const value = features[feature];
  const hasFeature = typeof value === 'boolean' ? value : value !== null;

  return { hasFeature, value };
}

/**
 * Hook to check if user can track more events
 */
export function useCanTrackEvent() {
  const { subscription, features } = useSubscription();
  const { data: remaining, isLoading } = useRemainingEvents();

  // Loading or error state
  if (!features || isLoading) {
    return { canTrack: false, isLoading: true, remaining: null };
  }

  // Unlimited events
  if (features.maxEventsPerMonth === null) {
    return { canTrack: true, isLoading: false, remaining: null };
  }

  // Free tier with limit
  const canTrack = remaining !== null ? remaining > 0 : false;

  return { canTrack, isLoading: false, remaining };
}

/**
 * Hook for upgrade prompts
 */
export function useUpgradePrompt() {
  const { tier, currentPlan } = useSubscription();
  const plans = usePricingPlans();

  const showUpgradePrompt = (
    requiredTier: SubscriptionTier,
    featureName: string
  ) => {
    const requiredPlan = getPricingPlan(requiredTier);
    if (!requiredPlan) return;

    Alert.alert(
      'Upgrade Required',
      `${featureName} requires the ${requiredPlan.name} plan or higher.`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: `Upgrade to ${requiredPlan.name}`,
          onPress: () => {
            // Navigate to pricing or open checkout
            // This would typically use navigation here
          },
        },
      ]
    );
  };

  const getUpgradePath = (): SubscriptionTier | null => {
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'small_fleet', 'fleet', 'enterprise'];
    const currentIndex = tierOrder.indexOf(tier);

    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }

    return null;
  };

  return {
    showUpgradePrompt,
    getUpgradePath,
    nextTier: getUpgradePath(),
  };
}

/**
 * Hook for subscription analytics/events
 */
export function useSubscriptionAnalytics() {
  const { subscription, tier } = useSubscription();

  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    // This would integrate with your analytics provider
    // For now, just log to console in development
    if (__DEV__) {
      console.log('[Subscription Event]', eventName, {
        tier,
        ...properties,
      });
    }
  };

  return {
    trackCheckoutStarted: (selectedTier: SubscriptionTier, interval: BillingInterval) =>
      trackEvent('checkout_started', { selectedTier, interval }),
    trackCheckoutCompleted: (newTier: SubscriptionTier) =>
      trackEvent('checkout_completed', { newTier }),
    trackUpgradeViewed: () => trackEvent('upgrade_viewed'),
    trackPortalOpened: () => trackEvent('portal_opened'),
  };
}
