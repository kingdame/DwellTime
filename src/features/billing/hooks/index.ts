/**
 * Billing Hooks
 *
 * NOTE: Billing operations now use Convex hooks from @/shared/hooks/convex:
 * - useSubscription(userId) - Get subscription
 * - useCreateSubscription() - Create subscription
 * - useUpdateSubscription() - Update subscription
 * - useCancelSubscription() - Cancel subscription
 *
 * The old TanStack Query hooks have been removed as they depended on
 * non-existent Supabase service functions.
 */

// Re-export Convex hooks for convenience
export {
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/shared/hooks/convex';
