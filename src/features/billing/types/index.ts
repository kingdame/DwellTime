/**
 * DwellTime Billing Types
 * Subscription and pricing type definitions
 */

export type SubscriptionTier = 'free' | 'pro' | 'small_fleet' | 'fleet' | 'enterprise';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export type BillingInterval = 'monthly' | 'annual';

export interface SubscriptionInfo {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  features: string[];
  limits: PlanLimits;
  isPopular?: boolean;
  trialDays?: number;
}

export interface PlanLimits {
  eventsPerMonth: number | 'unlimited';
  photosPerEvent: number;
  drivers?: number | 'unlimited';
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  exportFormats: string[];
  gpsLogging: boolean;
  facilityRatings: boolean;
  analyticsReports: boolean;
  fleetManagement: boolean;
}

export interface CheckoutSessionRequest {
  tier: Exclude<SubscriptionTier, 'free' | 'enterprise'>;
  interval: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface InvoicePaymentFailed {
  customerId: string;
  subscriptionId: string;
  amountDue: number;
  attemptCount: number;
  nextAttemptAt: string | null;
}

// Price IDs should be stored in environment variables
export interface StripePriceIds {
  pro_monthly: string;
  pro_annual: string;
  small_fleet_monthly: string;
  small_fleet_annual: string;
  fleet_monthly: string;
  fleet_annual: string;
}

// Feature flags based on subscription tier
export interface SubscriptionFeatures {
  canTrackEvents: boolean;
  canUploadPhotos: boolean;
  canExportInvoices: boolean;
  canManageFleet: boolean;
  canAccessApi: boolean;
  canCustomizeBranding: boolean;
  hasPrioritySupport: boolean;
  maxEventsPerMonth: number | null;
  maxPhotosPerEvent: number;
  maxDrivers: number | null;
}

// Billing event for analytics
export interface BillingEvent {
  type: 'checkout_started' | 'checkout_completed' | 'subscription_changed' | 'subscription_canceled' | 'payment_failed';
  tier?: SubscriptionTier;
  interval?: BillingInterval;
  previousTier?: SubscriptionTier;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
