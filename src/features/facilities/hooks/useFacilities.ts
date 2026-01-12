/**
 * useFacilities Hook
 * React Query hooks for facility operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFacilities,
  findNearbyFacilities,
  getFacility,
  createFacility,
  detectCurrentFacility,
  getRecentFacilities,
  searchFacilitiesWithFilters,
  getPopularFacilities,
  type FacilitySearchFilters,
  type FacilityCreateInput,
  type NearbyFacility,
} from '../services/facilityService';
import type { Facility } from '@/shared/types';

/**
 * Hook to search facilities by text
 */
export function useFacilitySearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['facilities', 'search', query],
    queryFn: () => searchFacilities(query),
    enabled: enabled && query.length >= 2, // Minimum 2 chars to search
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to find nearby facilities
 */
export function useNearbyFacilities(
  lat: number | null,
  lng: number | null,
  radiusMeters: number = 5000,
  limit: number = 20
) {
  return useQuery<NearbyFacility[]>({
    queryKey: ['facilities', 'nearby', lat, lng, radiusMeters, limit],
    queryFn: () => findNearbyFacilities(lat!, lng!, radiusMeters, limit),
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 2, // 2 minutes (location-based data can change)
  });
}

/**
 * Hook to get a single facility by ID
 */
export function useFacility(id: string | null) {
  return useQuery({
    queryKey: ['facilities', 'detail', id],
    queryFn: () => (id ? getFacility(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to detect current facility based on location
 */
export function useDetectFacility(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['facilities', 'detect', lat, lng],
    queryFn: () => detectCurrentFacility(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 30, // 30 seconds (check frequently)
    refetchInterval: 1000 * 60, // Refetch every minute when in view
  });
}

/**
 * Hook to get recently visited facilities
 */
export function useRecentFacilities(userId: string | null, limit: number = 5) {
  return useQuery({
    queryKey: ['facilities', 'recent', userId, limit],
    queryFn: () => (userId ? getRecentFacilities(userId, limit) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to search facilities with filters
 */
export function useFacilitiesWithFilters(
  filters: FacilitySearchFilters,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['facilities', 'filtered', filters],
    queryFn: () => searchFacilitiesWithFilters(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get popular facilities
 */
export function usePopularFacilities(limit: number = 10) {
  return useQuery({
    queryKey: ['facilities', 'popular', limit],
    queryFn: () => getPopularFacilities(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes (popular list changes slowly)
  });
}

/**
 * Hook to create a new facility
 */
export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FacilityCreateInput) => createFacility(input),
    onSuccess: (newFacility) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['facilities', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', 'nearby'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', 'filtered'] });

      // Add to cache directly
      queryClient.setQueryData(['facilities', 'detail', newFacility.id], newFacility);
    },
  });
}

// Re-export types
export type { FacilitySearchFilters, FacilityCreateInput, NearbyFacility };
