/**
 * Fleet Service
 * Utility functions for fleet management
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.fleets.get, { id }) - Get fleet
 * - useQuery(api.fleets.getByOwner, { ownerId }) - Get user's fleet
 * - useMutation(api.fleets.create) - Create fleet
 * - useMutation(api.fleets.update) - Update fleet
 */

export interface FleetStats {
  totalDrivers: number;
  activeDrivers: number;
  totalEarnings: number;
  totalDetentionMinutes: number;
  activeEvents: number;
}

/**
 * Calculate fleet stats from members and events
 */
export function calculateFleetStats(
  members: { status: string }[],
  events: { status: string; totalAmount: number; detentionMinutes: number }[]
): FleetStats {
  const activeDrivers = members.filter(m => m.status === 'active').length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const completedEvents = events.filter(e => 
    e.status === 'completed' || e.status === 'invoiced' || e.status === 'paid'
  );
  
  return {
    totalDrivers: members.length,
    activeDrivers,
    totalEarnings: completedEvents.reduce((sum, e) => sum + e.totalAmount, 0),
    totalDetentionMinutes: completedEvents.reduce((sum, e) => sum + e.detentionMinutes, 0),
    activeEvents,
  };
}

/**
 * Format member role for display
 */
export function formatMemberRole(role: 'admin' | 'driver'): string {
  return role === 'admin' ? 'Admin' : 'Driver';
}

/**
 * Format member status for display
 */
export function formatMemberStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'suspended':
      return 'Suspended';
    case 'removed':
      return 'Removed';
    default:
      return status;
  }
}

/**
 * Get status color
 */
export function getMemberStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#10B981'; // green
    case 'pending':
      return '#F59E0B'; // yellow
    case 'suspended':
      return '#EF4444'; // red
    case 'removed':
      return '#6B7280'; // gray
    default:
      return '#6B7280';
  }
}
