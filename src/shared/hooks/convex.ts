/**
 * Convex Hooks - Central export for all Convex-based hooks
 *
 * This replaces the Supabase-based service pattern with
 * real-time, type-safe Convex hooks.
 *
 * Usage:
 * ```typescript
 * import { useActiveDetentionEvent, useStartDetention } from '@/shared/hooks/convex';
 *
 * function MyComponent() {
 *   const activeEvent = useActiveDetentionEvent(userId);
 *   const startDetention = useStartDetention();
 *
 *   // activeEvent updates in real-time!
 *   // startDetention is a mutation function
 * }
 * ```
 */

// Fleet management
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
} from "@/features/fleet/hooks/useFleetConvex";

// Detention tracking
export {
  useDetentionEvents,
  useActiveDetentionEvent,
  useDetentionEvent,
  useDetentionEventsByFacility,
  useFleetDetentionEvents,
  useStartDetention,
  useEndDetention,
  useUpdateDetention,
  useMarkDetentionInvoiced,
  useMarkDetentionPaid,
  useDeleteDetention,
  useGpsLogs,
  useLatestGpsLog,
  useAddGpsLog,
  useAddGpsLogBatch,
  usePhotos,
  usePhotosByCategory,
  useAddPhoto,
  useUpdatePhotoCaption,
  useDeletePhoto,
} from "@/features/detention/hooks/useDetentionConvex";

// Invoices
export {
  useInvoices,
  useInvoice,
  useInvoiceByNumber,
  useAgingSummary,
  useCreateInvoice,
  useUpdateInvoice,
  useSetInvoicePdfUrl,
  useMarkInvoiceSent,
  useMarkInvoicePaid,
  useDeleteInvoice,
  useEmailContacts,
  useMostUsedContacts,
  useSearchContacts,
  useUpsertContact,
  useUpdateContact,
  useDeleteContact,
  useGetUploadUrl,
  useGetDownloadUrl,
} from "@/features/invoices/hooks/useInvoicesConvex";

// Facilities
export {
  useFacility,
  useSearchFacilities,
  useFacilitiesByCityState,
  useFacilitiesByType,
  useNearbyFacilities,
  useFacilitiesWithTruckEntrance,
  useCreateFacility,
  useUpdateFacility,
  useUpdateTruckEntrance,
  useFacilityReviews,
  useUserReviews,
  useEventReview,
  useFacilityPaymentStats,
  useCreateReview,
  useReportPayment,
} from "@/features/facilities/hooks/useFacilitiesConvex";

// Profile & Users
export {
  useUser,
  useUserByEmail,
  useCreateUser,
  useUpdateUser,
  useUpdateUserSubscription,
  useSetCurrentFleet,
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from "@/features/profile/hooks/useProfileConvex";

// Recovery
export {
  useRecoveryStats,
  useInvoicesForRecovery,
  useMarkSent,
  useMarkPaid,
  useReportPaymentOutcome,
  calculateROI,
} from "@/features/recovery/hooks/useRecoveryConvex";

// Fleet Invoices
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
} from "@/features/fleet/hooks/useFleetInvoicesConvex";

// History
export {
  useDetentionHistory,
  useHistorySummary,
  useMonthlySummary,
  getDateRange,
  formatDuration,
} from "@/features/history/hooks/useHistoryConvex";

// Email
export {
  useSendInvoiceEmail,
  useLogEmailSend,
  useEmailLogs,
  useSendAndLogEmail,
} from "@/features/invoices/hooks/useEmailConvex";
