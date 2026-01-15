/**
 * History Hooks - Convex-based detention history
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// HISTORY QUERIES
// ============================================================================

/**
 * Get detention history with filters
 */
export function useDetentionHistory(
  userId: Id<"users"> | undefined,
  options?: {
    startDate?: number;
    endDate?: number;
    facilityId?: Id<"facilities">;
    status?: "active" | "completed" | "invoiced" | "paid";
    eventType?: "pickup" | "delivery";
    limit?: number;
    offset?: number;
  }
) {
  return useQuery(
    api.history.getHistory,
    userId
      ? {
          userId,
          startDate: options?.startDate,
          endDate: options?.endDate,
          facilityId: options?.facilityId,
          status: options?.status,
          eventType: options?.eventType,
          limit: options?.limit,
          offset: options?.offset,
        }
      : "skip"
  );
}

/**
 * Get history summary stats
 */
export function useHistorySummary(
  userId: Id<"users"> | undefined,
  options?: {
    startDate?: number;
    endDate?: number;
  }
) {
  return useQuery(
    api.history.getHistorySummary,
    userId
      ? {
          userId,
          startDate: options?.startDate,
          endDate: options?.endDate,
        }
      : "skip"
  );
}

/**
 * Get monthly summary for charts
 */
export function useMonthlySummary(
  userId: Id<"users"> | undefined,
  months?: number
) {
  return useQuery(
    api.history.getMonthlySummary,
    userId ? { userId, months } : "skip"
  );
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Get date range for common periods
 */
export function getDateRange(period: "week" | "month" | "quarter" | "year") {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  switch (period) {
    case "week":
      return { startDate: now - 7 * day, endDate: now };
    case "month":
      return { startDate: now - 30 * day, endDate: now };
    case "quarter":
      return { startDate: now - 90 * day, endDate: now };
    case "year":
      return { startDate: now - 365 * day, endDate: now };
  }
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}
