/**
 * Profile Hooks - Convex-based user profile management
 * Replaces profileService.ts with real-time Convex queries
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Get user by ID
 */
export function useUser(userId: Id<"users"> | undefined) {
  return useQuery(api.users.get, userId ? { id: userId } : "skip");
}

/**
 * Get user by email
 */
export function useUserByEmail(email: string | undefined) {
  return useQuery(api.users.getByEmail, email ? { email } : "skip");
}

// ============================================================================
// USER MUTATIONS
// ============================================================================

/**
 * Create a new user
 */
export function useCreateUser() {
  return useMutation(api.users.create);
}

/**
 * Update user profile
 */
export function useUpdateUser() {
  return useMutation(api.users.update);
}

/**
 * Update user's subscription tier
 */
export function useUpdateUserSubscription() {
  return useMutation(api.users.updateSubscription);
}

/**
 * Set user's current fleet
 */
export function useSetCurrentFleet() {
  return useMutation(api.users.setCurrentFleet);
}

// ============================================================================
// SUBSCRIPTION QUERIES
// ============================================================================

/**
 * Get subscription for a user
 */
export function useSubscription(userId: Id<"users"> | undefined) {
  return useQuery(
    api.subscriptions.getByUser,
    userId ? { userId } : "skip"
  );
}

// ============================================================================
// SUBSCRIPTION MUTATIONS
// ============================================================================

/**
 * Create a subscription
 */
export function useCreateSubscription() {
  return useMutation(api.subscriptions.create);
}

/**
 * Update subscription
 */
export function useUpdateSubscription() {
  return useMutation(api.subscriptions.update);
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  return useMutation(api.subscriptions.cancel);
}
