/**
 * DwellTime Billing Service
 *
 * Handles all billing operations including checkout sessions,
 * subscription management, and customer portal access.
 */

import { supabase } from '../../../shared/lib/supabase';
import { openStripeUrl } from '../../../lib/stripe';
import type {
  SubscriptionTier,
  SubscriptionInfo,
  SubscriptionStatus,
  BillingInterval,
  PricingPlan,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CustomerPortalResponse,
  SubscriptionFeatures,
} from '../types';

// Supabase Edge Function URLs
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const getEdgeFunctionUrl = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`;

/**
 * Pricing plans configuration (from PRD)
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    description: 'Perfect for trying out DwellTime',
    monthlyPrice: 0,
    annualPrice: 0,
    annualSavings: 0,
    features: [
      '3 detention events per month',
      '5 photos per event',
      'Basic GPS logging',
      'Standard invoice templates',
      'Email support',
    ],
    limits: {
      eventsPerMonth: 3,
      photosPerEvent: 5,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      exportFormats: ['pdf'],
      gpsLogging: true,
      facilityRatings: true,
      analyticsReports: false,
      fleetManagement: false,
    },
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    description: 'For independent owner-operators',
    monthlyPrice: 12.99,
    annualPrice: 99,
    annualSavings: 57,
    isPopular: true,
    features: [
      'Unlimited detention events',
      '10 photos per event',
      'Enhanced GPS logging',
      'Custom invoice branding',
      'Export to PDF & CSV',
      'Facility ratings access',
      'Priority email support',
    ],
    limits: {
      eventsPerMonth: 'unlimited',
      photosPerEvent: 10,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
      exportFormats: ['pdf', 'csv'],
      gpsLogging: true,
      facilityRatings: true,
      analyticsReports: true,
      fleetManagement: false,
    },
  },
  {
    id: 'small_fleet',
    tier: 'small_fleet',
    name: 'Small Fleet',
    description: 'For small trucking companies (2-10 drivers)',
    monthlyPrice: 49.99,
    annualPrice: 399,
    annualSavings: 201,
    trialDays: 14,
    features: [
      'Everything in Pro',
      'Up to 10 drivers',
      'Fleet dashboard',
      'Driver management',
      'Consolidated reporting',
      'Phone support',
    ],
    limits: {
      eventsPerMonth: 'unlimited',
      photosPerEvent: 10,
      drivers: 10,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
      exportFormats: ['pdf', 'csv', 'excel'],
      gpsLogging: true,
      facilityRatings: true,
      analyticsReports: true,
      fleetManagement: true,
    },
  },
  {
    id: 'fleet',
    tier: 'fleet',
    name: 'Fleet',
    description: 'For growing fleets (11-50 drivers)',
    monthlyPrice: 79.99,
    annualPrice: 649,
    annualSavings: 311,
    trialDays: 14,
    features: [
      'Everything in Small Fleet',
      'Up to 50 drivers',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
    limits: {
      eventsPerMonth: 'unlimited',
      photosPerEvent: 20,
      drivers: 50,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      exportFormats: ['pdf', 'csv', 'excel', 'json'],
      gpsLogging: true,
      facilityRatings: true,
      analyticsReports: true,
      fleetManagement: true,
    },
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For large fleets (50+ drivers)',
    monthlyPrice: 0, // Custom pricing
    annualPrice: 0,
    annualSavings: 0,
    features: [
      'Unlimited drivers',
      'Custom contract',
      'SLA guarantees',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise deployment option',
    ],
    limits: {
      eventsPerMonth: 'unlimited',
      photosPerEvent: 50,
      drivers: 'unlimited',
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      exportFormats: ['pdf', 'csv', 'excel', 'json', 'xml'],
      gpsLogging: true,
      facilityRatings: true,
      analyticsReports: true,
      fleetManagement: true,
    },
  },
];

/**
 * Get the current user's auth token
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession(
  tier: Exclude<SubscriptionTier, 'free' | 'enterprise'>,
  interval: BillingInterval
): Promise<CheckoutSessionResponse> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to subscribe');
  }

  const request: CheckoutSessionRequest = {
    tier,
    interval,
  };

  const response = await fetch(getEdgeFunctionUrl('create-checkout'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Open a checkout session in the browser
 */
export async function openCheckout(
  tier: Exclude<SubscriptionTier, 'free' | 'enterprise'>,
  interval: BillingInterval
): Promise<boolean> {
  const { url } = await createCheckoutSession(tier, interval);
  return openStripeUrl(url);
}

/**
 * Open the Stripe customer portal for subscription management
 */
export async function openCustomerPortal(): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to manage your subscription');
  }

  const response = await fetch(getEdgeFunctionUrl('customer-portal'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to open customer portal');
  }

  const { url }: CustomerPortalResponse = await response.json();
  return openStripeUrl(url);
}

/**
 * Get the current user's subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // User has no subscription, default to free
    return {
      id: '',
      userId: user.id,
      tier: 'free',
      status: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    userId: data.user_id,
    tier: data.tier as SubscriptionTier,
    status: data.status as SubscriptionStatus,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end || false,
    trialEnd: data.trial_end,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all available pricing plans
 */
export function getPricingPlans(): PricingPlan[] {
  return PRICING_PLANS;
}

/**
 * Get a specific pricing plan by tier
 */
export function getPricingPlan(tier: SubscriptionTier): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.tier === tier);
}

/**
 * Get subscription features based on tier
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  const plan = getPricingPlan(tier);
  if (!plan) {
    // Default to free tier limits
    return {
      canTrackEvents: true,
      canUploadPhotos: true,
      canExportInvoices: true,
      canManageFleet: false,
      canAccessApi: false,
      canCustomizeBranding: false,
      hasPrioritySupport: false,
      maxEventsPerMonth: 3,
      maxPhotosPerEvent: 5,
      maxDrivers: null,
    };
  }

  return {
    canTrackEvents: true,
    canUploadPhotos: true,
    canExportInvoices: true,
    canManageFleet: plan.limits.fleetManagement,
    canAccessApi: plan.limits.apiAccess,
    canCustomizeBranding: plan.limits.customBranding,
    hasPrioritySupport: plan.limits.prioritySupport,
    maxEventsPerMonth: plan.limits.eventsPerMonth === 'unlimited' ? null : plan.limits.eventsPerMonth,
    maxPhotosPerEvent: plan.limits.photosPerEvent,
    maxDrivers: plan.limits.drivers === 'unlimited' ? null : (plan.limits.drivers || null),
  };
}

/**
 * Check if user can perform an action based on subscription
 */
export async function canPerformAction(
  action: keyof SubscriptionFeatures
): Promise<boolean> {
  const subscription = await getSubscriptionStatus();
  if (!subscription) return false;

  const features = getSubscriptionFeatures(subscription.tier);
  const value = features[action];

  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric limits, just check if value exists
  return value !== null && value !== undefined;
}

/**
 * Get remaining events for the month (for free tier)
 */
export async function getRemainingEvents(): Promise<number | null> {
  const subscription = await getSubscriptionStatus();
  if (!subscription || subscription.tier !== 'free') {
    return null; // Unlimited
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // Count events this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('detention_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('Error counting events:', error);
    return 0;
  }

  const used = count || 0;
  const limit = 3; // Free tier limit
  return Math.max(0, limit - used);
}

/**
 * Check if subscription is active (not canceled or past due)
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    trialing: 'Trial',
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
  };
  return statusMap[status] || status;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEnd: string | null): number | null {
  if (!trialEnd) return null;

  const endDate = new Date(trialEnd);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}
