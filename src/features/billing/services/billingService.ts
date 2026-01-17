/**
 * Billing Service
 * Utility functions for subscription and billing management
 *
 * NOTE: Billing operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.subscriptions.get, { userId }) - Get subscription
 * - useMutation(api.subscriptions.update) - Update subscription
 */

export type SubscriptionTier = 'free' | 'pro' | 'small_fleet' | 'fleet' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status?: SubscriptionStatus;
  periodEnd?: number;
  stripeCustomerId?: string;
}

export interface TierFeatures {
  maxEvents: number;
  maxStorage: string;
  pdfExport: boolean;
  emailInvoices: boolean;
  fleetManagement: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

/**
 * Tier feature limits
 */
export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxEvents: 10,
    maxStorage: '100 MB',
    pdfExport: false,
    emailInvoices: false,
    fleetManagement: false,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxEvents: -1, // unlimited
    maxStorage: '5 GB',
    pdfExport: true,
    emailInvoices: true,
    fleetManagement: false,
    apiAccess: false,
    prioritySupport: false,
  },
  small_fleet: {
    maxEvents: -1,
    maxStorage: '25 GB',
    pdfExport: true,
    emailInvoices: true,
    fleetManagement: true,
    apiAccess: false,
    prioritySupport: true,
  },
  fleet: {
    maxEvents: -1,
    maxStorage: '100 GB',
    pdfExport: true,
    emailInvoices: true,
    fleetManagement: true,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    maxEvents: -1,
    maxStorage: 'Unlimited',
    pdfExport: true,
    emailInvoices: true,
    fleetManagement: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return 'Free';
    case 'pro':
      return 'Pro';
    case 'small_fleet':
      return 'Small Fleet';
    case 'fleet':
      return 'Fleet';
    case 'enterprise':
      return 'Enterprise';
    default:
      return tier;
  }
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status?: SubscriptionStatus): string {
  if (!status) return 'Unknown';
  
  switch (status) {
    case 'trialing':
      return 'Trial';
    case 'active':
      return 'Active';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'unpaid':
      return 'Unpaid';
    default:
      return status;
  }
}

/**
 * Get status color
 */
export function getStatusColor(status?: SubscriptionStatus): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return '#10B981'; // green
    case 'past_due':
      return '#F59E0B'; // yellow
    case 'canceled':
    case 'unpaid':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}

/**
 * Check if tier has a feature
 */
export function tierHasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const features = TIER_FEATURES[tier];
  if (typeof features[feature] === 'boolean') {
    return features[feature] as boolean;
  }
  return true;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status?: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Format period end date
 */
export function formatPeriodEnd(timestamp?: number): string {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
