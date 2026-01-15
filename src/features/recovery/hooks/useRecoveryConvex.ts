/**
 * Recovery Hooks - Convex-based invoice recovery tracking
 * Replaces recoveryService.ts with real-time Convex queries
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// RECOVERY DASHBOARD
// ============================================================================

/**
 * Get aging summary for recovery dashboard
 * Returns real-time aging buckets, totals, and collection rate
 */
export function useRecoveryStats(userId: Id<"users"> | undefined) {
  return useQuery(
    api.invoices.getAgingSummary,
    userId ? { userId } : "skip"
  );
}

/**
 * Get all invoices for recovery tracking
 */
export function useInvoicesForRecovery(
  userId: Id<"users"> | undefined,
  options?: {
    status?: "draft" | "sent" | "paid" | "partially_paid";
    limit?: number;
  }
) {
  return useQuery(
    api.invoices.list,
    userId ? { userId, status: options?.status, limit: options?.limit } : "skip"
  );
}

// ============================================================================
// INVOICE TRACKING MUTATIONS
// ============================================================================

/**
 * Mark invoice as sent
 */
export function useMarkSent() {
  return useMutation(api.invoices.markSent);
}

/**
 * Mark invoice as paid
 */
export function useMarkPaid() {
  return useMutation(api.invoices.markPaid);
}

// ============================================================================
// FACILITY PAYMENT STATS
// ============================================================================

/**
 * Get payment statistics for a facility
 */
export function useFacilityPaymentStats(facilityId: Id<"facilities"> | undefined) {
  return useQuery(
    api.facilityReviews.getPaymentStats,
    facilityId ? { facilityId } : "skip"
  );
}

/**
 * Report payment outcome for a review
 */
export function useReportPaymentOutcome() {
  return useMutation(api.facilityReviews.reportPayment);
}

// ============================================================================
// ROI CALCULATION HELPERS
// ============================================================================

/**
 * Calculate ROI metrics from recovery stats
 */
export function calculateROI(stats: {
  totalPaid: number;
  totalInvoiced: number;
  paidCount: number;
  unpaidCount: number;
}) {
  const collectionRate = stats.totalInvoiced > 0
    ? (stats.totalPaid / stats.totalInvoiced) * 100
    : 0;

  const avgInvoiceValue = stats.paidCount > 0
    ? stats.totalPaid / stats.paidCount
    : 0;

  // Estimate time saved per invoice (assume 2 hours without app)
  const hoursSaved = stats.paidCount * 2;

  // Estimate value of time saved (at average trucker rate of $25/hr)
  const timeValueSaved = hoursSaved * 25;

  return {
    collectionRate: Math.round(collectionRate * 10) / 10,
    avgInvoiceValue: Math.round(avgInvoiceValue * 100) / 100,
    hoursSaved,
    timeValueSaved,
    totalRecovered: stats.totalPaid,
  };
}
