/**
 * Fleet Hooks
 * Re-exports all fleet management hooks
 */

// Fleet CRUD hooks
export {
  useFleet,
  useUserFleets,
  useCreateFleet,
  useUpdateFleet,
  useDeleteFleet,
  fleetKeys,
} from './useFleet';

export type {
  Fleet,
  FleetCreateInput,
  FleetUpdateInput,
} from './useFleet';

// Fleet member hooks
export {
  useFleetMembers,
  useAddFleetMember,
  useUpdateMemberStatus,
  useUpdateMemberRole,
  useRemoveFleetMember,
  fleetMemberKeys,
} from './useFleetMembers';

export type {
  FleetMember,
  FleetMemberWithUser,
  MemberRole,
  MemberStatus,
} from './useFleetMembers';

// Fleet invitation hooks
export {
  usePendingInvitations,
  useInvitationByCode,
  useCreateInvitation,
  useAcceptInvitation,
  useCancelInvitation,
  useResendInvitation,
  fleetInvitationKeys,
} from './useFleetInvitations';

export type {
  FleetInvitation,
  FleetInvitationWithDetails,
  CreateInvitationInput,
} from './useFleetInvitations';

// Fleet events hooks
export {
  useFleetEvents,
  useFleetEventsByMember,
  useFleetEventsByStatus,
  useFleetEventsDateRange,
  useFleetSummary,
  usePaginatedFleetEvents,
  fleetEventKeys,
} from './useFleetEvents';

export type {
  FleetEventWithMember,
  FleetEventFilters,
  FleetSummary,
} from './useFleetEvents';

// Fleet invoice hooks
export {
  useFleetInvoices,
  useFleetInvoiceDetails,
  useFleetInvoiceSummary,
  useCreateFleetInvoice,
  useUpdateFleetInvoiceStatus,
  useDeleteFleetInvoice,
  fleetInvoiceKeys,
} from './useFleetInvoices';

export type {
  FleetInvoice,
  FleetInvoiceWithDetails,
  FleetInvoiceStatus,
  CreateFleetInvoiceInput,
} from './useFleetInvoices';
