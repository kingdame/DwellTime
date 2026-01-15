/**
 * GPS Logs - Location tracking for detention events
 * High-write optimized for frequent location updates
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all GPS logs for a detention event
 */
export const getByEvent = query({
  args: {
    detentionEventId: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gpsLogs")
      .withIndex("by_event", (q) =>
        q.eq("detentionEventId", args.detentionEventId)
      )
      .collect();
  },
});

/**
 * Get latest GPS log for a detention event
 */
export const getLatest = query({
  args: {
    detentionEventId: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("gpsLogs")
      .withIndex("by_event", (q) =>
        q.eq("detentionEventId", args.detentionEventId)
      )
      .order("desc")
      .take(1);

    return logs[0] ?? null;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a GPS log entry
 */
export const add = mutation({
  args: {
    detentionEventId: v.id("detentionEvents"),
    lat: v.number(),
    lng: v.number(),
    accuracy: v.optional(v.number()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("gpsLogs", {
      detentionEventId: args.detentionEventId,
      lat: args.lat,
      lng: args.lng,
      accuracy: args.accuracy,
      timestamp: args.timestamp ?? Date.now(),
    });

    return logId;
  },
});

/**
 * Batch add GPS logs (for syncing offline data)
 */
export const addBatch = mutation({
  args: {
    logs: v.array(
      v.object({
        detentionEventId: v.id("detentionEvents"),
        lat: v.number(),
        lng: v.number(),
        accuracy: v.optional(v.number()),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];

    for (const log of args.logs) {
      const logId = await ctx.db.insert("gpsLogs", log);
      ids.push(logId);
    }

    return ids;
  },
});
