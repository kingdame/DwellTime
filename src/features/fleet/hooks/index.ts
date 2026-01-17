/**
 * Fleet Hooks
 *
 * NOTE: All fleet data operations now use Convex hooks.
 * The old TanStack Query hooks have been removed as they
 * depended on non-existent Supabase service functions.
 */

// Convex Fleet Hooks
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
} from './useFleetConvex';

// Convex Fleet Invoice Hooks
export {
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
} from './useFleetInvoicesConvex';

// Detention events use the shared detention hooks:
// import { useFleetDetentionEvents } from '@/shared/hooks/convex';
