/**
 * Fleets - Fleet management queries and mutations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get fleet by ID
 */
export const get = query({
  args: {
    id: v.id("fleets"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get fleets owned by a user
 */
export const getByOwner = query({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fleets")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

/**
 * Get all fleets a user is a member of
 */
export const getUserFleets = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all memberships for this user
    const memberships = await ctx.db
      .query("fleetMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeMembers = memberships.filter((m) => m.status === "active");

    // Get the fleets
    const fleets = [];
    for (const membership of activeMembers) {
      const fleet = await ctx.db.get(membership.fleetId);
      if (fleet) {
        fleets.push({
          ...fleet,
          memberRole: membership.role,
        });
      }
    }

    return fleets;
  },
});

/**
 * Get fleet dashboard summary
 */
export const getDashboard = query({
  args: {
    fleetId: v.id("fleets"),
  },
  handler: async (ctx, args) => {
    // Get members
    const members = await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    const activeMembers = members.filter((m) => m.status === "active");

    // Get detention events for fleet
    const events = await ctx.db
      .query("detentionEvents")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    // Calculate stats
    const activeEvents = events.filter((e) => e.status === "active");
    const completedEvents = events.filter((e) => e.status === "completed");
    const invoicedEvents = events.filter((e) => e.status === "invoiced");
    const paidEvents = events.filter((e) => e.status === "paid");

    const totalDetentionMinutes = events.reduce(
      (sum, e) => sum + e.detentionMinutes,
      0
    );
    const totalAmount = events.reduce((sum, e) => sum + e.totalAmount, 0);
    const paidAmount = paidEvents.reduce((sum, e) => sum + e.totalAmount, 0);

    // Get fleet invoices
    const fleetInvoices = await ctx.db
      .query("fleetInvoices")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    const pendingInvoices = fleetInvoices.filter((i) => i.status === "sent");
    const paidInvoices = fleetInvoices.filter((i) => i.status === "paid");

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalEvents: events.length,
      eventsByStatus: {
        active: activeEvents.length,
        completed: completedEvents.length,
        invoiced: invoicedEvents.length,
        paid: paidEvents.length,
      },
      totalDetentionMinutes,
      totalAmount,
      paidAmount,
      unpaidAmount: totalAmount - paidAmount,
      averageDetentionMinutes:
        events.length > 0
          ? Math.round(totalDetentionMinutes / events.length)
          : 0,
      pendingInvoices: pendingInvoices.length,
      paidInvoices: paidInvoices.length,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new fleet
 */
export const create = mutation({
  args: {
    name: v.string(),
    ownerId: v.id("users"),
    companyName: v.optional(v.string()),
    dotNumber: v.optional(v.string()),
    mcNumber: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    defaultHourlyRate: v.optional(v.number()),
    defaultGracePeriodMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Create the fleet
    const fleetId = await ctx.db.insert("fleets", {
      name: args.name,
      ownerId: args.ownerId,
      companyName: args.companyName,
      dotNumber: args.dotNumber,
      mcNumber: args.mcNumber,
      billingEmail: args.billingEmail,
      maxDrivers: 10,
      defaultHourlyRate: args.defaultHourlyRate,
      defaultGracePeriodMinutes: args.defaultGracePeriodMinutes,
      settings: {
        allowMemberInvites: false,
        requireApprovalForEvents: false,
        autoConsolidateInvoices: true,
        invoiceConsolidationPeriod: "biweekly",
        notifyOnNewEvents: true,
        notifyOnInvoiceReady: true,
      },
    });

    // Add owner as admin member
    await ctx.db.insert("fleetMembers", {
      fleetId,
      userId: args.ownerId,
      role: "admin",
      status: "active",
      joinedAt: Date.now(),
    });

    // Update user's current fleet
    await ctx.db.patch(args.ownerId, {
      currentFleetId: fleetId,
      fleetRole: "admin",
    });

    return fleetId;
  },
});

/**
 * Update fleet settings
 */
export const update = mutation({
  args: {
    id: v.id("fleets"),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    dotNumber: v.optional(v.string()),
    mcNumber: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    defaultHourlyRate: v.optional(v.number()),
    defaultGracePeriodMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

/**
 * Update fleet settings object
 */
export const updateSettings = mutation({
  args: {
    id: v.id("fleets"),
    settings: v.object({
      allowMemberInvites: v.optional(v.boolean()),
      requireApprovalForEvents: v.optional(v.boolean()),
      autoConsolidateInvoices: v.optional(v.boolean()),
      invoiceConsolidationPeriod: v.optional(
        v.union(
          v.literal("weekly"),
          v.literal("biweekly"),
          v.literal("monthly")
        )
      ),
      notifyOnNewEvents: v.optional(v.boolean()),
      notifyOnInvoiceReady: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const fleet = await ctx.db.get(args.id);
    if (!fleet) {
      throw new Error("Fleet not found");
    }

    await ctx.db.patch(args.id, {
      settings: {
        ...fleet.settings,
        ...args.settings,
      },
    });
  },
});

/**
 * Delete a fleet (owner only)
 */
export const remove = mutation({
  args: {
    id: v.id("fleets"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const fleet = await ctx.db.get(args.id);
    if (!fleet) {
      throw new Error("Fleet not found");
    }

    if (fleet.ownerId !== args.requestingUserId) {
      throw new Error("Only the fleet owner can delete the fleet");
    }

    // Delete all members
    const members = await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.id))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all invitations
    const invitations = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.id))
      .collect();

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    // Delete the fleet
    await ctx.db.delete(args.id);
  },
});
