/**
 * Fleet Invitation Service
 * Utility functions for fleet invitations
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.fleetInvitations.list, { fleetId }) - Get invitations
 * - useMutation(api.fleetInvitations.create) - Create invitation
 * - useMutation(api.fleetInvitations.accept) - Accept invitation
 * - useMutation(api.fleetInvitations.revoke) - Revoke invitation
 */

export interface FleetInvitation {
  id: string;
  fleetId: string;
  email: string;
  phone?: string;
  invitationCode: string;
  role: 'admin' | 'driver';
  invitedBy: string;
  expiresAt: number;
  acceptedAt?: number;
}

/**
 * Generate a unique invitation code
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if invitation is expired
 */
export function isInvitationExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Check if invitation is accepted
 */
export function isInvitationAccepted(acceptedAt?: number): boolean {
  return acceptedAt !== undefined;
}

/**
 * Get invitation status
 */
export function getInvitationStatus(
  invitation: FleetInvitation
): 'pending' | 'accepted' | 'expired' {
  if (isInvitationAccepted(invitation.acceptedAt)) {
    return 'accepted';
  }
  if (isInvitationExpired(invitation.expiresAt)) {
    return 'expired';
  }
  return 'pending';
}

/**
 * Format expiration time
 */
export function formatExpirationTime(expiresAt: number): string {
  const now = Date.now();
  const diff = expiresAt - now;
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Default invitation expiration (7 days)
 */
export const DEFAULT_INVITATION_EXPIRY_DAYS = 7;

/**
 * Calculate expiration timestamp
 */
export function calculateExpirationTime(days: number = DEFAULT_INVITATION_EXPIRY_DAYS): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}
