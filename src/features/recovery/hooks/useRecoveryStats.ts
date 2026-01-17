/**
 * Recovery Stats Hooks - Re-exports from Convex
 */

import type { Id } from "@/convex/_generated/dataModel";
import { useRecoveryStats as useRecoveryStatsConvex, calculateROI } from "./useRecoveryConvex";

/**
 * Get recovery summary for dashboard
 */
export function useRecoverySummary(userId: Id<"users"> | undefined) {
  const stats = useRecoveryStatsConvex(userId);
  return stats;
}

/**
 * Calculate ROI metrics
 */
export function useROICalculation(stats: {
  totalPaid: number;
  totalInvoiced: number;
  paidCount: number;
  unpaidCount: number;
} | undefined) {
  if (!stats) return undefined;
  return calculateROI(stats);
}
