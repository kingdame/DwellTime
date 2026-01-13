/**
 * useFleetMembers Hooks
 * React Query hooks for fleet member management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFleetMembers,
  addFleetMember,
  updateMemberStatus,
  updateMemberRole,
  removeFleetMember,
  type FleetMember,
  type FleetMemberWithUser,
  type MemberRole,
  type MemberStatus,
} from '../services';
import { fleetKeys } from './useFleet';

// Query keys for fleet member operations
export const fleetMemberKeys = {
  all: ['fleet-members'] as const,
  lists: () => [...fleetMemberKeys.all, 'list'] as const,
  list: (fleetId: string, includeStats?: boolean) =>
    [...fleetMemberKeys.lists(), fleetId, { includeStats }] as const,
  details: () => [...fleetMemberKeys.all, 'detail'] as const,
  detail: (memberId: string) => [...fleetMemberKeys.details(), memberId] as const,
};

/**
 * Hook to fetch all members of a fleet
 */
export function useFleetMembers(fleetId: string | null, includeStats: boolean = false) {
  return useQuery({
    queryKey: fleetMemberKeys.list(fleetId || '', includeStats),
    queryFn: () => (fleetId ? fetchFleetMembers(fleetId, includeStats) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to add a new member to a fleet
 */
export function useAddFleetMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fleetId,
      userId,
      role = 'driver',
    }: {
      fleetId: string;
      userId: string;
      role?: MemberRole;
    }) => addFleetMember(fleetId, userId, role),
    onSuccess: (newMember, { fleetId }) => {
      // Invalidate fleet members list
      queryClient.invalidateQueries({ queryKey: fleetMemberKeys.lists() });

      // Invalidate fleet summary (member count changed)
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', fleetId] });

      // Invalidate user's fleet list (they now have access)
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
    },
  });
}

/**
 * Hook to update a member's status (activate/suspend)
 */
export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: 'active' | 'suspended';
    }) => updateMemberStatus(memberId, status),
    onSuccess: (updatedMember) => {
      // Update member in cache
      queryClient.setQueryData(
        fleetMemberKeys.detail(updatedMember.id),
        (old: FleetMember | undefined) =>
          old ? { ...old, ...updatedMember } : updatedMember
      );

      // Invalidate member lists
      queryClient.invalidateQueries({ queryKey: fleetMemberKeys.lists() });

      // Invalidate fleet summary (active count may have changed)
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', updatedMember.fleet_id] });
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: MemberRole;
    }) => updateMemberRole(memberId, role),
    onSuccess: (updatedMember) => {
      // Update member in cache
      queryClient.setQueryData(
        fleetMemberKeys.detail(updatedMember.id),
        (old: FleetMember | undefined) =>
          old ? { ...old, ...updatedMember } : updatedMember
      );

      // Invalidate member lists
      queryClient.invalidateQueries({ queryKey: fleetMemberKeys.lists() });
    },
  });
}

/**
 * Hook to remove a member from a fleet
 */
export function useRemoveFleetMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      fleetId,
    }: {
      memberId: string;
      fleetId: string;
    }) => removeFleetMember(memberId),
    onSuccess: (_, { memberId, fleetId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: fleetMemberKeys.detail(memberId) });

      // Invalidate member lists
      queryClient.invalidateQueries({ queryKey: fleetMemberKeys.lists() });

      // Invalidate fleet summary (member count changed)
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', fleetId] });

      // Invalidate user's fleet list
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });
    },
  });
}

// Re-export types for convenience
export type { FleetMember, FleetMemberWithUser, MemberRole, MemberStatus };
