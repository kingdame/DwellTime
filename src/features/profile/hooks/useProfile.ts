/**
 * Profile Hooks - Re-exports from Convex
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Get user profile
 */
export function useProfile(userId: Id<"users"> | undefined) {
  return useQuery(api.users.get, userId ? { id: userId } : "skip");
}

/**
 * Update user profile
 * Returns a mutation function that matches the old API
 */
export function useUpdateProfile() {
  const updateMutation = useMutation(api.users.update);
  
  return {
    mutateAsync: async (data: {
      userId: Id<"users">;
      hourlyRate?: number;
      gracePeriodMinutes?: number;
      companyName?: string;
      invoiceTerms?: string;
      email?: string;
      fullName?: string;
    }) => {
      const { userId, ...updates } = data;
      
      // Map old field names to new ones if needed
      const mappedUpdates: Record<string, unknown> = {};
      
      if (updates.hourlyRate !== undefined) {
        mappedUpdates.defaultHourlyRate = updates.hourlyRate;
      }
      if (updates.gracePeriodMinutes !== undefined) {
        mappedUpdates.defaultGracePeriod = updates.gracePeriodMinutes;
      }
      if (updates.companyName !== undefined) {
        mappedUpdates.companyName = updates.companyName;
      }
      if (updates.invoiceTerms !== undefined) {
        mappedUpdates.invoiceTerms = updates.invoiceTerms;
      }
      if (updates.email !== undefined) {
        mappedUpdates.email = updates.email;
      }
      if (updates.fullName !== undefined) {
        mappedUpdates.fullName = updates.fullName;
      }
      
      await updateMutation({ id: userId, ...mappedUpdates });
    },
    isPending: false,
    isError: false,
    error: null,
  };
}
