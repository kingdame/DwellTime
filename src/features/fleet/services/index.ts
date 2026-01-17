/**
 * Fleet Services - Utility functions only
 *
 * NOTE: Data operations now use Convex. Use hooks from @/shared/hooks/convex:
 * - useFleet, useUserFleets, useCreateFleet, etc.
 * - useFleetMembers, useAddFleetMember, etc.
 * - useFleetInvitations, useCreateInvitation, etc.
 * - useFleetInvoices, useCreateFleetInvoice, etc.
 */

// Fleet utility functions
export {
  type FleetStats,
  calculateFleetStats,
  formatMemberRole,
  formatMemberStatus,
  getMemberStatusColor,
} from './fleetService';

// Member utility functions
export {
  type FleetMember,
  canManageMembers,
  canInviteDrivers,
  canViewAnalytics,
  canEditSettings,
  getEffectiveHourlyRate,
  getEffectiveGracePeriod,
} from './memberService';

// Invitation utility functions
export {
  type FleetInvitation,
  generateInvitationCode,
  isInvitationExpired,
  isInvitationAccepted,
  getInvitationStatus,
  formatExpirationTime,
  DEFAULT_INVITATION_EXPIRY_DAYS,
  calculateExpirationTime,
} from './invitationService';

// Fleet invoice utility functions
export {
  type FleetInvoice,
  generateFleetInvoiceNumber,
  formatInvoiceStatus,
  getInvoiceStatusColor,
  formatDateRange,
} from './fleetInvoiceService';
