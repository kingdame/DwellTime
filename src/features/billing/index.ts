/**
 * DwellTime Billing Feature
 *
 * Stripe subscription management for DwellTime app.
 * Handles Pro, Small Fleet, Fleet, and Enterprise tiers.
 */

// Types
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

// Services
export {
  PRICING_PLANS,
  createCheckoutSession,
  openCheckout,
  openCustomerPortal,
  getSubscriptionStatus,
  getPricingPlans,
  getPricingPlan,
  getSubscriptionFeatures,
  canPerformAction,
  getRemainingEvents,
  isSubscriptionActive,
  formatSubscriptionStatus,
  getTrialDaysRemaining,
} from './services/billingService';

// Hooks
export {
  subscriptionKeys,
  useSubscription,
  useRemainingEvents,
  usePricingPlans,
  useCheckout,
  useCustomerPortal,
  useSubscriptionFeature,
  useCanTrackEvent,
  useUpgradePrompt,
  useSubscriptionAnalytics,
} from './hooks/useSubscription';

// Components
export {
  PricingCard,
  PricingComparison,
  IntervalToggle,
} from './components/PricingCard';
