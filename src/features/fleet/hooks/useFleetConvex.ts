/**
 * Fleet Hooks - Convex-based fleet management
 * Replaces fleetService.ts with real-time Convex queries
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// FLEET QUERIES
// ============================================================================

/**
 * Get fleet by ID
 */
export function useFleet(fleetId: Id<"fleets"> | undefined) {
  return useQuery(api.fleets.get, fleetId ? { id: fleetId } : "skip");
}

/**
 * Get all fleets a user is a member of
 */
export function useUserFleets(userId: Id<"users"> | undefined) {
  return useQuery(api.fleets.getUserFleets, userId ? { userId } : "skip");
}

/**
 * Get fleets owned by a user
 */
export function useOwnedFleets(ownerId: Id<"users"> | undefined) {
  return useQuery(api.fleets.getByOwner, ownerId ? { ownerId } : "skip");
}

/**
 * Get fleet dashboard summary - real-time stats
 */
export function useFleetDashboard(fleetId: Id<"fleets"> | undefined) {
  return useQuery(api.fleets.getDashboard, fleetId ? { fleetId } : "skip");
}

// ============================================================================
// FLEET MUTATIONS
// ============================================================================

/**
 * Create a new fleet
 */
export function useCreateFleet() {
  return useMutation(api.fleets.create);
}

/**
 * Update fleet settings
 */
export function useUpdateFleet() {
  return useMutation(api.fleets.update);
}

/**
 * Update fleet settings object
 */
export function useUpdateFleetSettings() {
  return useMutation(api.fleets.updateSettings);
}

/**
 * Delete a fleet
 */
export function useDeleteFleet() {
  return useMutation(api.fleets.remove);
}

// ============================================================================
// FLEET MEMBER QUERIES
// ============================================================================

/**
 * Get all members of a fleet
 */
export function useFleetMembers(
  fleetId: Id<"fleets"> | undefined,
  status?: "pending" | "active" | "suspended" | "removed"
) {
  return useQuery(
    api.fleetMembers.getByFleet,
    fleetId ? { fleetId, status } : "skip"
  );
}

/**
 * Get a user's membership in a fleet
 */
export function useMembership(
  fleetId: Id<"fleets"> | undefined,
  userId: Id<"users"> | undefined
) {
  return useQuery(
    api.fleetMembers.getMembership,
    fleetId && userId ? { fleetId, userId } : "skip"
  );
}

/**
 * Check if user is a fleet admin
 */
export function useIsFleetAdmin(
  fleetId: Id<"fleets"> | undefined,
  userId: Id<"users"> | undefined
) {
  return useQuery(
    api.fleetMembers.isAdmin,
    fleetId && userId ? { fleetId, userId } : "skip"
  );
}

// ============================================================================
// FLEET MEMBER MUTATIONS
// ============================================================================

/**
 * Add a member to a fleet
 */
export function useAddFleetMember() {
  return useMutation(api.fleetMembers.add);
}

/**
 * Update member role
 */
export function useUpdateMemberRole() {
  return useMutation(api.fleetMembers.updateRole);
}

/**
 * Update member status
 */
export function useUpdateMemberStatus() {
  return useMutation(api.fleetMembers.updateStatus);
}

/**
 * Remove a member from a fleet
 */
export function useRemoveFleetMember() {
  return useMutation(api.fleetMembers.remove);
}

// ============================================================================
// FLEET INVITATION QUERIES
// ============================================================================

/**
 * Get pending invitations for a fleet
 */
export function useFleetInvitations(fleetId: Id<"fleets"> | undefined) {
  return useQuery(
    api.fleetInvitations.getByFleet,
    fleetId ? { fleetId } : "skip"
  );
}

/**
 * Get invitation by code (for accepting)
 */
export function useInvitationByCode(code: string | undefined) {
  return useQuery(
    api.fleetInvitations.getByCode,
    code ? { code } : "skip"
  );
}

/**
 * Get invitations for a user's email
 */
export function useInvitationsForEmail(email: string | undefined) {
  return useQuery(
    api.fleetInvitations.getByEmail,
    email ? { email } : "skip"
  );
}

// ============================================================================
// FLEET INVITATION MUTATIONS
// ============================================================================

/**
 * Create a new invitation
 */
export function useCreateInvitation() {
  return useMutation(api.fleetInvitations.create);
}

/**
 * Accept an invitation
 */
export function useAcceptInvitation() {
  return useMutation(api.fleetInvitations.accept);
}

/**
 * Resend an invitation
 */
export function useResendInvitation() {
  return useMutation(api.fleetInvitations.resend);
}

/**
 * Cancel an invitation
 */
export function useCancelInvitation() {
  return useMutation(api.fleetInvitations.cancel);
}
