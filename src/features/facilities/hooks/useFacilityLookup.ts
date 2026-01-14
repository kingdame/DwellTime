/**
 * useFacilityLookup Hook
 * React Query hooks for facility lookup/check feature
 */

import { useQuery } from '@tanstack/react-query';
import { getFacilityWithReviews } from '../services/facilityService';

/**
 * Hook to get facility with its reviews for preview card
 */
export function useFacilityWithReviews(facilityId: string | null, reviewLimit: number = 5) {
  return useQuery({
    queryKey: ['facilities', 'withReviews', facilityId, reviewLimit],
    queryFn: () => (facilityId ? getFacilityWithReviews(facilityId, reviewLimit) : null),
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
