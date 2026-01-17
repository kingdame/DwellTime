/**
 * DwellTime Billing Feature
 *
 * Subscription management for DwellTime app.
 * Handles Pro, Small Fleet, Fleet, and Enterprise tiers.
 *
 * NOTE: Billing operations now use Convex hooks from @/shared/hooks/convex:
 * - useSubscription(userId) - Get subscription
 * - useCreateSubscription() - Create subscription
 * - useUpdateSubscription() - Update subscription
 * - useCancelSubscription() - Cancel subscription
 */

// Types from types/index.ts
export type {
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  SubscriptionInfo,
  PricingPlan,
  PlanLimits,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CustomerPortalResponse,
  StripeWebhookEvent,
  StripePriceIds,
  SubscriptionFeatures,
  BillingEvent,
} from './types';

// Types and utilities from services/billingService
export {
  type TierFeatures,
  TIER_FEATURES,
  getTierDisplayName,
  getStatusDisplayName,
  getStatusColor,
  tierHasFeature,
  isSubscriptionActive,
  formatPeriodEnd,
} from './services/billingService';

// Components
export { PricingCard, PricingComparison, IntervalToggle } from './components/PricingCard';
