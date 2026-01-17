/**
 * Fleet Member Service
 * Utility functions for fleet member management
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.fleetMembers.list, { fleetId }) - Get members
 * - useMutation(api.fleetMembers.add) - Add member
 * - useMutation(api.fleetMembers.updateRole) - Update role
 * - useMutation(api.fleetMembers.remove) - Remove member
 */

export interface FleetMember {
  id: string;
  fleetId: string;
  userId: string;
  role: 'admin' | 'driver';
  status: 'pending' | 'active' | 'suspended' | 'removed';
  invitedBy?: string;
  invitedAt?: number;
  joinedAt?: number;
  settingsOverride?: {
    hourlyRate?: number;
    gracePeriodMinutes?: number;
  };
}

/**
 * Check if user can manage members
 */
export function canManageMembers(userRole: 'admin' | 'driver' | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Check if user can invite drivers
 */
export function canInviteDrivers(userRole: 'admin' | 'driver' | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Check if user can view fleet analytics
 */
export function canViewAnalytics(userRole: 'admin' | 'driver' | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Check if user can edit fleet settings
 */
export function canEditSettings(userRole: 'admin' | 'driver' | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Get effective hourly rate for a member (with override)
 */
export function getEffectiveHourlyRate(
  member: FleetMember,
  fleetDefault: number
): number {
  return member.settingsOverride?.hourlyRate ?? fleetDefault;
}

/**
 * Get effective grace period for a member (with override)
 */
export function getEffectiveGracePeriod(
  member: FleetMember,
  fleetDefault: number
): number {
  return member.settingsOverride?.gracePeriodMinutes ?? fleetDefault;
}
