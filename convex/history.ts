/**
 * History - Detention event history queries
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================================================
// HISTORY QUERIES
// ============================================================================

/**
 * Get detention history with filters
 */
export const getHistory = query({
  args: {
    userId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    facilityId: v.optional(v.id("facilities")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("invoiced"),
        v.literal("paid")
      )
    ),
    eventType: v.optional(v.union(v.literal("pickup"), v.literal("delivery"))),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("detentionEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Apply filters
    if (args.startDate) {
      events = events.filter((e) => e.arrivalTime >= args.startDate!);
    }

    if (args.endDate) {
      events = events.filter((e) => e.arrivalTime <= args.endDate!);
    }

    if (args.facilityId) {
      events = events.filter((e) => e.facilityId === args.facilityId);
    }

    if (args.status) {
      events = events.filter((e) => e.status === args.status);
    }

    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }

    // Get total count before pagination
    const totalCount = events.length;

    // Apply pagination
    if (args.offset) {
      events = events.slice(args.offset);
    }

    if (args.limit) {
      events = events.slice(0, args.limit);
    }

    // Enrich with facility names
    const enrichedEvents = [];
    for (const event of events) {
      let facilityName = null;
      if (event.facilityId) {
        const facility = await ctx.db.get(event.facilityId);
        facilityName = facility?.name ?? null;
      }
      enrichedEvents.push({
        ...event,
        facilityName,
      });
    }

    return {
      events: enrichedEvents,
      totalCount,
      hasMore: args.limit
        ? (args.offset ?? 0) + events.length < totalCount
        : false,
    };
  },
});

/**
 * Get history summary stats
 */
export const getHistorySummary = query({
  args: {
    userId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("detentionEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Apply date filters
    if (args.startDate) {
      events = events.filter((e) => e.arrivalTime >= args.startDate!);
    }

    if (args.endDate) {
      events = events.filter((e) => e.arrivalTime <= args.endDate!);
    }

    const totalEvents = events.length;
    const totalDetentionMinutes = events.reduce(
      (sum, e) => sum + e.detentionMinutes,
      0
    );
    const totalAmount = events.reduce((sum, e) => sum + e.totalAmount, 0);

    const byStatus = {
      active: events.filter((e) => e.status === "active").length,
      completed: events.filter((e) => e.status === "completed").length,
      invoiced: events.filter((e) => e.status === "invoiced").length,
      paid: events.filter((e) => e.status === "paid").length,
    };

    const byType = {
      pickup: events.filter((e) => e.eventType === "pickup").length,
      delivery: events.filter((e) => e.eventType === "delivery").length,
    };

    // Get top facilities
    const facilityMap = new Map<string, { count: number; totalMinutes: number }>();
    for (const event of events) {
      if (event.facilityId) {
        const existing = facilityMap.get(event.facilityId) ?? {
          count: 0,
          totalMinutes: 0,
        };
        facilityMap.set(event.facilityId, {
          count: existing.count + 1,
          totalMinutes: existing.totalMinutes + event.detentionMinutes,
        });
      }
    }

    const topFacilities = [];
    for (const [facilityId, stats] of facilityMap.entries()) {
      const facility = await ctx.db.get(facilityId as any);
      if (facility) {
        topFacilities.push({
          id: facilityId,
          name: facility.name,
          ...stats,
        });
      }
    }

    topFacilities.sort((a, b) => b.count - a.count);

    return {
      totalEvents,
      totalDetentionMinutes,
      totalDetentionHours: Math.round((totalDetentionMinutes / 60) * 10) / 10,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageDetentionMinutes:
        totalEvents > 0 ? Math.round(totalDetentionMinutes / totalEvents) : 0,
      averageAmount:
        totalEvents > 0 ? Math.round((totalAmount / totalEvents) * 100) / 100 : 0,
      byStatus,
      byType,
      topFacilities: topFacilities.slice(0, 5),
    };
  },
});

/**
 * Get monthly summary for charts
 */
export const getMonthlySummary = query({
  args: {
    userId: v.id("users"),
    months: v.optional(v.number()), // Number of months to look back
  },
  handler: async (ctx, args) => {
    const monthsBack = args.months ?? 12;
    const now = Date.now();
    const startDate = now - monthsBack * 30 * 24 * 60 * 60 * 1000;

    const events = await ctx.db
      .query("detentionEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const filteredEvents = events.filter((e) => e.arrivalTime >= startDate);

    // Group by month
    const monthlyData = new Map<
      string,
      { count: number; minutes: number; amount: number }
    >();

    for (const event of filteredEvents) {
      const date = new Date(event.arrivalTime);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(key) ?? {
        count: 0,
        minutes: 0,
        amount: 0,
      };

      monthlyData.set(key, {
        count: existing.count + 1,
        minutes: existing.minutes + event.detentionMinutes,
        amount: existing.amount + event.totalAmount,
      });
    }

    // Convert to array and sort
    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        amount: Math.round(data.amount * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  },
});
