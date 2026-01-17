/**
 * Fleet Feature Exports
 *
 * NOTE: All fleet data operations now use Convex hooks from @/shared/hooks/convex
 * or the local hooks exported below.
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
  useIsFleetAdmin as useIsFleetAdminStore,
  type FleetState,
} from './store';

// Services - Utility functions
export {
  // Fleet
  type FleetStats,
  calculateFleetStats,
  formatMemberRole,
  formatMemberStatus,
  getMemberStatusColor,
  // Member
  type FleetMember as FleetMemberType,
  canManageMembers,
  canInviteDrivers,
  canViewAnalytics,
  canEditSettings,
  getEffectiveHourlyRate,
  getEffectiveGracePeriod,
  // Invitation
  type FleetInvitation as FleetInvitationType,
  generateInvitationCode,
  isInvitationExpired,
  isInvitationAccepted,
  getInvitationStatus,
  formatExpirationTime,
  DEFAULT_INVITATION_EXPIRY_DAYS,
  calculateExpirationTime,
  // Fleet Invoice
  type FleetInvoice as FleetInvoiceType,
  generateFleetInvoiceNumber,
  formatInvoiceStatus,
  getInvoiceStatusColor,
  formatDateRange,
} from './services';

// Convex Hooks
export {
  useFleet,
  useUserFleets,
  useOwnedFleets,
  useFleetDashboard,
  useCreateFleet,
  useUpdateFleet,
  useUpdateFleetSettings,
  useDeleteFleet,
  useFleetMembers,
  useMembership,
  useIsFleetAdmin,
  useAddFleetMember,
  useUpdateMemberRole,
  useUpdateMemberStatus,
  useRemoveFleetMember,
  useFleetInvitations,
  useInvitationByCode,
  useInvitationsForEmail,
  useCreateInvitation,
  useAcceptInvitation,
  useResendInvitation,
  useCancelInvitation,
  useFleetInvoices,
  useFleetInvoice,
  useFleetInvoiceByNumber,
  useFleetBillingSummary,
  useCreateFleetInvoice,
  useUpdateFleetInvoice,
  useSetFleetInvoicePdfUrl,
  useMarkFleetInvoiceSent,
  useMarkFleetInvoicePaid,
  useDeleteFleetInvoice,
  useSendFleetInvoiceEmail,
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
