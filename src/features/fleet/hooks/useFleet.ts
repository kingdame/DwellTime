/**
 * useFleet Hooks
 * React Query hooks for fleet CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFleet,
  fetchFleet,
  updateFleet,
  fetchUserFleets,
  deleteFleet,
  type Fleet,
  type FleetCreateInput,
  type FleetUpdateInput,
} from '../services';

// Query keys for fleet operations
export const fleetKeys = {
  all: ['fleets'] as const,
  lists: () => [...fleetKeys.all, 'list'] as const,
  list: (userId: string) => [...fleetKeys.lists(), userId] as const,
  details: () => [...fleetKeys.all, 'detail'] as const,
  detail: (fleetId: string) => [...fleetKeys.details(), fleetId] as const,
};

/**
 * Hook to fetch a single fleet by ID
 */
export function useFleet(fleetId: string | null) {
  return useQuery({
    queryKey: fleetKeys.detail(fleetId || ''),
    queryFn: () => (fleetId ? fetchFleet(fleetId) : null),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all fleets for a user
 */
export function useUserFleets(userId: string | null) {
  return useQuery({
    queryKey: fleetKeys.list(userId || ''),
    queryFn: () => (userId ? fetchUserFleets(userId) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new fleet
 */
export function useCreateFleet(ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FleetCreateInput) => createFleet(ownerId, input),
    onSuccess: (newFleet) => {
      // Invalidate user's fleet list
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });

      // Add new fleet to cache
      queryClient.setQueryData(fleetKeys.detail(newFleet.id), newFleet);
    },
  });
}

/**
 * Hook to update an existing fleet
 */
export function useUpdateFleet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fleetId,
      updates,
    }: {
      fleetId: string;
      updates: FleetUpdateInput;
    }) => updateFleet(fleetId, updates),
    onSuccess: (updatedFleet) => {
      // Update fleet in cache
      queryClient.setQueryData(
        fleetKeys.detail(updatedFleet.id),
        (old: Fleet | undefined) => (old ? { ...old, ...updatedFleet } : updatedFleet)
      );

      // Invalidate lists to reflect name/company changes
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
    },
  });
}

/**
 * Hook to delete a fleet
 */
export function useDeleteFleet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fleetId, ownerId }: { fleetId: string; ownerId: string }) =>
      deleteFleet(fleetId, ownerId),
    onSuccess: (_, { fleetId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: fleetKeys.detail(fleetId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });

      // Invalidate related data
      queryClient.invalidateQueries({ queryKey: ['fleet-members', fleetId] });
      queryClient.invalidateQueries({ queryKey: ['fleet-invitations', fleetId] });
      queryClient.invalidateQueries({ queryKey: ['fleet-invoices', fleetId] });
    },
  });
}

// Re-export types for convenience
export type { Fleet, FleetCreateInput, FleetUpdateInput };
