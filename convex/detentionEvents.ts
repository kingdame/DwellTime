/**
 * Detention Events - Core tracking queries and mutations
 *
 * Real-time by default - all queries automatically update when data changes
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all detention events for a user
 */
export const list = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("invoiced"),
        v.literal("paid")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("detentionEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.status) {
      q = ctx.db
        .query("detentionEvents")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status!)
        )
        .order("desc");
    }

    const events = args.limit ? await q.take(args.limit) : await q.collect();

    return events;
  },
});

/**
 * Get the currently active detention event for a user (if any)
 */
export const getActive = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const activeEvent = await ctx.db
      .query("detentionEvents")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active")
      )
      .first();

    return activeEvent;
  },
});

/**
 * Get a single detention event by ID
 */
export const get = query({
  args: {
    id: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get detention events by facility
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("detentionEvents")
      .withIndex("by_facility", (q) => q.eq("facilityId", args.facilityId))
      .order("desc");

    return args.limit ? await q.take(args.limit) : await q.collect();
  },
});

/**
 * Get events for fleet dashboard (admin view)
 */
export const getFleetEvents = query({
  args: {
    fleetId: v.id("fleets"),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("invoiced"),
        v.literal("paid")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("detentionEvents")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .order("desc")
      .collect();

    if (args.status) {
      events = events.filter((e) => e.status === args.status);
    }

    if (args.limit) {
      events = events.slice(0, args.limit);
    }

    return events;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Start a new detention event (check-in at facility)
 */
export const start = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),
    loadReference: v.optional(v.string()),
    eventType: v.union(v.literal("pickup"), v.literal("delivery")),
    hourlyRate: v.number(),
    gracePeriodMinutes: v.number(),
    fleetId: v.optional(v.id("fleets")),
    fleetMemberId: v.optional(v.id("fleetMembers")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const gracePeriodEnd = now + args.gracePeriodMinutes * 60 * 1000;

    const eventId = await ctx.db.insert("detentionEvents", {
      userId: args.userId,
      facilityId: args.facilityId,
      loadReference: args.loadReference,
      eventType: args.eventType,
      arrivalTime: now,
      gracePeriodEnd: gracePeriodEnd,
      detentionMinutes: 0,
      hourlyRate: args.hourlyRate,
      totalAmount: 0,
      status: "active",
      fleetId: args.fleetId,
      fleetMemberId: args.fleetMemberId,
      fleetVisible: true,
    });

    return eventId;
  },
});

/**
 * End a detention event (check-out from facility)
 */
export const end = mutation({
  args: {
    id: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Detention event not found");
    }

    if (event.status !== "active") {
      throw new Error("Event is not active");
    }

    const now = Date.now();
    const arrivalTime = event.arrivalTime;
    const gracePeriodEnd = event.gracePeriodEnd ?? arrivalTime;

    // Calculate detention time
    let detentionMinutes = 0;
    let detentionStart: number | undefined;

    if (now > gracePeriodEnd) {
      detentionStart = gracePeriodEnd;
      detentionMinutes = Math.floor((now - gracePeriodEnd) / (1000 * 60));
    }

    // Calculate total amount
    const totalAmount = (detentionMinutes / 60) * event.hourlyRate;

    await ctx.db.patch(args.id, {
      departureTime: now,
      detentionStart,
      detentionMinutes,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to cents
      status: "completed",
    });

    return {
      detentionMinutes,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  },
});

/**
 * Update an existing detention event
 */
export const update = mutation({
  args: {
    id: v.id("detentionEvents"),
    loadReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    facilityId: v.optional(v.id("facilities")),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

/**
 * Mark event as invoiced
 */
export const markInvoiced = mutation({
  args: {
    id: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "invoiced",
    });
  },
});

/**
 * Mark event as paid
 */
export const markPaid = mutation({
  args: {
    id: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "paid",
    });
  },
});

/**
 * Delete a detention event (only if draft/active)
 */
export const remove = mutation({
  args: {
    id: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Detention event not found");
    }

    if (event.status === "invoiced" || event.status === "paid") {
      throw new Error("Cannot delete invoiced or paid events");
    }

    // Delete associated GPS logs
    const gpsLogs = await ctx.db
      .query("gpsLogs")
      .withIndex("by_event", (q) => q.eq("detentionEventId", args.id))
      .collect();

    for (const log of gpsLogs) {
      await ctx.db.delete(log._id);
    }

    // Delete associated photos
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_event", (q) => q.eq("detentionEventId", args.id))
      .collect();

    for (const photo of photos) {
      await ctx.db.delete(photo._id);
    }

    await ctx.db.delete(args.id);
  },
});
