/**
 * Fleet Feature Exports
 */

// Types
export type {
  FleetRole,
  MemberStatus,
  FleetSubscriptionTier,
  FleetSubscriptionStatus,
  FleetInvoiceStatus,
  Fleet,
  FleetSettings,
  FleetMember,
  FleetInvitation,
  FleetInvoice,
  DriverMetrics,
  FleetSummary,
  FleetCreateInput,
  FleetMemberInviteInput,
  FleetSettingsUpdateInput,
  FleetWithMembers,
  FleetMemberWithUser,
} from './types';

// Store
export {
  useFleetStore,
  useCurrentFleet,
  useCurrentRole,
  useFleetMembers as useFleetMembersStore,
  useFleetSummary as useFleetSummaryStore,
  useFleetLoading,
  useFleetError,
  useSelectedDriverId,
  useIsFleetAdmin,
  type FleetState,
} from './store';

// React Query Hooks
export {
  // Fleet CRUD
  useFleet,
  useUserFleets,
  useCreateFleet,
  useUpdateFleet,
  useDeleteFleet,
  fleetKeys,
  // Fleet Members
  useFleetMembers,
  useAddFleetMember,
  useUpdateMemberStatus,
  useUpdateMemberRole,
  useRemoveFleetMember,
  fleetMemberKeys,
  // Fleet Invitations
  usePendingInvitations,
  useInvitationByCode,
  useCreateInvitation,
  useAcceptInvitation,
  useCancelInvitation,
  useResendInvitation,
  fleetInvitationKeys,
  // Fleet Events
  useFleetEvents,
  useFleetEventsByMember,
  useFleetEventsByStatus,
  useFleetEventsDateRange,
  useFleetSummary,
  usePaginatedFleetEvents,
  fleetEventKeys,
  // Fleet Invoices
  useFleetInvoices,
  useFleetInvoiceDetails,
  useFleetInvoiceSummary,
  useCreateFleetInvoice,
  useUpdateFleetInvoiceStatus,
  useDeleteFleetInvoice,
  fleetInvoiceKeys,
} from './hooks';

export type {
  FleetEventWithMember,
  FleetEventFilters,
  CreateInvitationInput,
  FleetInvitationWithDetails,
  FleetInvoiceWithDetails,
  CreateFleetInvoiceInput,
  MemberRole,
} from './hooks';

// Components
export {
  FleetDashboard,
  FleetMetricsCard,
  DriverCard,
  DriverList,
  DriverDetailModal,
  FleetEventCard,
  FleetEventsList,
  InviteDriverModal,
  TeamInvoiceModal,
  FleetSettingsModal,
  type DriverListItem,
  type FleetEventItem,
} from './components';
