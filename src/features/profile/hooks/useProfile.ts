/**
 * useProfile Hook
 * React Query hooks for profile operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import {
  fetchUserProfile,
  updateUserProfile,
  type ProfileUpdateInput,
  type ProfileUpdateResult,
} from '../services/profileService';
import type { User } from '@/shared/types';

/**
 * Hook to fetch current user profile
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => (userId ? fetchUserProfile(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateUserProfile(userId, input),
    onSuccess: (result: ProfileUpdateResult) => {
      if (result.success && result.user) {
        // Update auth store with new user data
        setUser(result.user);

        // Update profile cache
        queryClient.setQueryData(['profile', userId], result.user);

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });
}

/**
 * Hook to get profile from auth store (synchronous)
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Hook to check if profile is complete
 */
export function useIsProfileComplete(user: User | null): boolean {
  if (!user) return false;

  return !!(
    user.name &&
    user.hourly_rate &&
    user.hourly_rate >= 10
  );
}

/**
 * Hook to get profile completion percentage
 */
export function useProfileCompletion(user: User | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!user) {
    return { percentage: 0, missingFields: ['All fields'] };
  }

  const fields = [
    { key: 'name', label: 'Name', filled: !!user.name },
    { key: 'phone', label: 'Phone', filled: !!user.phone },
    { key: 'company_name', label: 'Company name', filled: !!user.company_name },
    { key: 'hourly_rate', label: 'Hourly rate', filled: !!user.hourly_rate && user.hourly_rate >= 10 },
    { key: 'grace_period_minutes', label: 'Grace period', filled: user.grace_period_minutes !== undefined },
  ];

  const filledCount = fields.filter((f) => f.filled).length;
  const missingFields = fields.filter((f) => !f.filled).map((f) => f.label);

  return {
    percentage: Math.round((filledCount / fields.length) * 100),
    missingFields,
  };
}

// Re-export types
export type { ProfileUpdateInput, ProfileUpdateResult };
