/**
 * useFleetEvents Hooks
 * React Query hooks for fleet event viewing and dashboard summary
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchFleetEvents,
  fetchFleetSummary,
  type FleetEventWithMember,
  type FleetEventFilters,
  type FleetSummary,
} from '../services';

// Query keys for fleet event operations
export const fleetEventKeys = {
  all: ['fleet-events'] as const,
  lists: () => [...fleetEventKeys.all, 'list'] as const,
  list: (fleetId: string, filters?: FleetEventFilters) =>
    [...fleetEventKeys.lists(), fleetId, filters] as const,
  summary: (fleetId: string) => ['fleet-summary', fleetId] as const,
};

/**
 * Hook to fetch fleet events with filtering and pagination
 */
export function useFleetEvents(
  fleetId: string | null,
  filters: FleetEventFilters = {}
) {
  return useQuery({
    queryKey: fleetEventKeys.list(fleetId || '', filters),
    queryFn: () => (fleetId ? fetchFleetEvents(fleetId, filters) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch fleet events filtered by member
 */
export function useFleetEventsByMember(
  fleetId: string | null,
  memberId: string | null,
  additionalFilters: Omit<FleetEventFilters, 'memberId'> = {}
) {
  const filters: FleetEventFilters = {
    ...additionalFilters,
    memberId: memberId || undefined,
  };

  return useQuery({
    queryKey: fleetEventKeys.list(fleetId || '', filters),
    queryFn: () => (fleetId && memberId ? fetchFleetEvents(fleetId, filters) : []),
    enabled: !!fleetId && !!memberId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch fleet events filtered by status
 */
export function useFleetEventsByStatus(
  fleetId: string | null,
  status: FleetEventFilters['status'],
  additionalFilters: Omit<FleetEventFilters, 'status'> = {}
) {
  const filters: FleetEventFilters = {
    ...additionalFilters,
    status,
  };

  return useQuery({
    queryKey: fleetEventKeys.list(fleetId || '', filters),
    queryFn: () => (fleetId ? fetchFleetEvents(fleetId, filters) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch fleet events for a date range
 */
export function useFleetEventsDateRange(
  fleetId: string | null,
  startDate: string | null,
  endDate: string | null,
  additionalFilters: Omit<FleetEventFilters, 'startDate' | 'endDate'> = {}
) {
  const filters: FleetEventFilters = {
    ...additionalFilters,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  return useQuery({
    queryKey: fleetEventKeys.list(fleetId || '', filters),
    queryFn: () => (fleetId ? fetchFleetEvents(fleetId, filters) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch fleet dashboard summary statistics
 */
export function useFleetSummary(fleetId: string | null) {
  return useQuery({
    queryKey: fleetEventKeys.summary(fleetId || ''),
    queryFn: () => (fleetId ? fetchFleetSummary(fleetId) : null),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch paginated fleet events
 */
export function usePaginatedFleetEvents(
  fleetId: string | null,
  page: number,
  pageSize: number = 20,
  additionalFilters: Omit<FleetEventFilters, 'limit' | 'offset'> = {}
) {
  const offset = (page - 1) * pageSize;
  const filters: FleetEventFilters = {
    ...additionalFilters,
    limit: pageSize,
    offset,
  };

  return useQuery({
    queryKey: fleetEventKeys.list(fleetId || '', filters),
    queryFn: () => (fleetId ? fetchFleetEvents(fleetId, filters) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

// Re-export types for convenience
export type { FleetEventWithMember, FleetEventFilters, FleetSummary };
