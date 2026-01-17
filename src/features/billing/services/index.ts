/**
 * Billing Services
 * 
 * NOTE: Billing operations now use Convex. Use hooks from @/shared/hooks/convex:
 * - useSubscription(userId) - Get subscription
 * - useCreateSubscription() - Create subscription
 * - useUpdateSubscription() - Update subscription
 * - useCancelSubscription() - Cancel subscription
 */

export {
  // Types
  type SubscriptionTier,
  type SubscriptionStatus,
  type SubscriptionInfo,
  type TierFeatures,
  // Constants
  TIER_FEATURES,
  // Utility functions
  getTierDisplayName,
  getStatusDisplayName,
  getStatusColor,
  tierHasFeature,
  isSubscriptionActive,
  formatPeriodEnd,
} from './billingService';
