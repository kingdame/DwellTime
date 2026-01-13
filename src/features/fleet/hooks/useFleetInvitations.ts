/**
 * useFleetInvitations Hooks
 * React Query hooks for fleet invitation management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInvitation,
  fetchPendingInvitations,
  fetchInvitationByCode,
  acceptInvitation,
  cancelInvitation,
  resendInvitation,
  type FleetInvitation,
  type FleetInvitationWithDetails,
  type CreateInvitationInput,
} from '../services';
import { fleetKeys } from './useFleet';
import { fleetMemberKeys } from './useFleetMembers';

// Query keys for fleet invitation operations
export const fleetInvitationKeys = {
  all: ['fleet-invitations'] as const,
  lists: () => [...fleetInvitationKeys.all, 'list'] as const,
  pending: (fleetId: string) => [...fleetInvitationKeys.lists(), 'pending', fleetId] as const,
  details: () => [...fleetInvitationKeys.all, 'detail'] as const,
  detail: (invitationId: string) => [...fleetInvitationKeys.details(), invitationId] as const,
  byCode: (code: string) => [...fleetInvitationKeys.all, 'code', code] as const,
};

/**
 * Hook to fetch pending invitations for a fleet
 */
export function usePendingInvitations(fleetId: string | null) {
  return useQuery({
    queryKey: fleetInvitationKeys.pending(fleetId || ''),
    queryFn: () => (fleetId ? fetchPendingInvitations(fleetId) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch an invitation by code (for accepting invitations)
 */
export function useInvitationByCode(code: string | null) {
  return useQuery({
    queryKey: fleetInvitationKeys.byCode(code || ''),
    queryFn: () => (code ? fetchInvitationByCode(code) : null),
    enabled: !!code && code.length > 0,
    staleTime: 1000 * 60, // 1 minute
    retry: false, // Don't retry failed invitation lookups
  });
}

/**
 * Hook to create a new invitation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fleetId,
      invitedBy,
      input,
    }: {
      fleetId: string;
      invitedBy: string;
      input: CreateInvitationInput;
    }) => createInvitation(fleetId, invitedBy, input),
    onSuccess: (newInvitation, { fleetId }) => {
      // Invalidate pending invitations list
      queryClient.invalidateQueries({
        queryKey: fleetInvitationKeys.pending(fleetId),
      });

      // Invalidate fleet summary (pending invitations count changed)
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', fleetId] });

      // Add new invitation to cache
      queryClient.setQueryData(
        fleetInvitationKeys.detail(newInvitation.id),
        newInvitation
      );
    },
  });
}

/**
 * Hook to accept an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      code,
      userId,
      userEmail,
    }: {
      code: string;
      userId: string;
      userEmail: string;
    }) => acceptInvitation(code, userId, userEmail),
    onSuccess: (result, { code }) => {
      const { fleetId } = result;

      // Invalidate invitation cache
      queryClient.invalidateQueries({
        queryKey: fleetInvitationKeys.byCode(code),
      });
      queryClient.invalidateQueries({
        queryKey: fleetInvitationKeys.pending(fleetId),
      });

      // Invalidate fleet members (new member added)
      queryClient.invalidateQueries({
        queryKey: fleetMemberKeys.lists(),
      });

      // Invalidate user's fleet list (they now have access to new fleet)
      queryClient.invalidateQueries({ queryKey: fleetKeys.lists() });

      // Invalidate fleet summary
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', fleetId] });
    },
  });
}

/**
 * Hook to cancel a pending invitation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      fleetId,
    }: {
      invitationId: string;
      fleetId: string;
    }) => cancelInvitation(invitationId),
    onSuccess: (_, { invitationId, fleetId }) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: fleetInvitationKeys.detail(invitationId),
      });

      // Invalidate pending invitations list
      queryClient.invalidateQueries({
        queryKey: fleetInvitationKeys.pending(fleetId),
      });

      // Invalidate fleet summary (pending invitations count changed)
      queryClient.invalidateQueries({ queryKey: ['fleet-summary', fleetId] });
    },
  });
}

/**
 * Hook to resend an invitation (regenerate code and extend expiration)
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      expiresInDays,
    }: {
      invitationId: string;
      fleetId: string;
      expiresInDays?: number;
    }) => resendInvitation(invitationId, expiresInDays),
    onSuccess: (updatedInvitation, { fleetId }) => {
      // Update invitation in cache
      queryClient.setQueryData(
        fleetInvitationKeys.detail(updatedInvitation.id),
        updatedInvitation
      );

      // Invalidate pending invitations list
      queryClient.invalidateQueries({
        queryKey: fleetInvitationKeys.pending(fleetId),
      });
    },
  });
}

// Re-export types for convenience
export type { FleetInvitation, FleetInvitationWithDetails, CreateInvitationInput };
