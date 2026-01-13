/**
 * Fleet Services
 * Exports all fleet management services
 */

// Fleet CRUD operations
export {
  createFleet,
  fetchFleet,
  updateFleet,
  fetchFleetSummary,
  fetchFleetEvents,
  fetchUserFleets,
  deleteFleet,
} from './fleetService';

export type {
  Fleet,
  FleetSettings,
  FleetCreateInput,
  FleetUpdateInput,
  FleetSummary,
  FleetEventFilters,
  FleetEventWithMember,
} from './fleetService';

// Member management
export {
  fetchFleetMembers,
  fetchFleetMember,
  addFleetMember,
  updateMemberStatus,
  updateMemberRole,
  removeFleetMember,
  checkMemberRole,
  isFleetAdmin,
  getUserMembership,
  transferOwnership,
} from './memberService';

export type {
  MemberRole,
  MemberStatus,
  FleetMember,
  FleetMemberWithUser,
  AddMemberInput,
} from './memberService';

// Invitation handling
export {
  generateInvitationCode,
  createInvitation,
  fetchPendingInvitations,
  fetchInvitationByCode,
  acceptInvitation,
  cancelInvitation,
  resendInvitation,
  cleanupExpiredInvitations,
  fetchInvitationHistory,
} from './invitationService';

export type {
  InvitationStatus,
  FleetInvitation,
  FleetInvitationWithDetails,
  CreateInvitationInput,
} from './invitationService';

// Team invoicing
export {
  createFleetInvoice,
  fetchFleetInvoices,
  fetchFleetInvoiceWithDetails,
  updateFleetInvoiceStatus,
  generateFleetInvoicePDF,
  shareFleetInvoicePDF,
  deleteFleetInvoice,
  getFleetInvoiceSummary,
} from './fleetInvoiceService';

export type {
  FleetInvoiceStatus,
  FleetInvoice,
  FleetInvoiceWithDetails,
  MemberInvoiceDetail,
  FleetInvoiceLineItem,
  CreateFleetInvoiceInput,
} from './fleetInvoiceService';
