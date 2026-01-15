/**
 * Fleet Members - Driver membership management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all members of a fleet
 */
export const getByFleet = query({
  args: {
    fleetId: v.id("fleets"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("suspended"),
        v.literal("removed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let members;

    if (args.status) {
      members = await ctx.db
        .query("fleetMembers")
        .withIndex("by_fleet_status", (q) =>
          q.eq("fleetId", args.fleetId).eq("status", args.status!)
        )
        .collect();
    } else {
      members = await ctx.db
        .query("fleetMembers")
        .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
        .collect();
    }

    // Enrich with user data
    const enrichedMembers = [];
    for (const member of members) {
      const user = await ctx.db.get(member.userId);
      enrichedMembers.push({
        ...member,
        user: user
          ? {
              name: user.name,
              email: user.email,
              phone: user.phone,
            }
          : null,
      });
    }

    return enrichedMembers;
  },
});

/**
 * Get a user's membership in a fleet
 */
export const getMembership = query({
  args: {
    fleetId: v.id("fleets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet_user", (q) =>
        q.eq("fleetId", args.fleetId).eq("userId", args.userId)
      )
      .first();
  },
});

/**
 * Check if user is a fleet admin
 */
export const isAdmin = query({
  args: {
    fleetId: v.id("fleets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if owner
    const fleet = await ctx.db.get(args.fleetId);
    if (fleet?.ownerId === args.userId) {
      return true;
    }

    // Check membership
    const membership = await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet_user", (q) =>
        q.eq("fleetId", args.fleetId).eq("userId", args.userId)
      )
      .first();

    return membership?.role === "admin" && membership?.status === "active";
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a member to a fleet
 */
export const add = mutation({
  args: {
    fleetId: v.id("fleets"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("driver")),
    invitedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if already a member
    const existing = await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet_user", (q) =>
        q.eq("fleetId", args.fleetId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("User is already a member of this fleet");
    }

    const memberId = await ctx.db.insert("fleetMembers", {
      fleetId: args.fleetId,
      userId: args.userId,
      role: args.role,
      status: "active",
      invitedBy: args.invitedBy,
      invitedAt: args.invitedBy ? Date.now() : undefined,
      joinedAt: Date.now(),
    });

    // Update user's current fleet
    await ctx.db.patch(args.userId, {
      currentFleetId: args.fleetId,
      fleetRole: args.role,
    });

    return memberId;
  },
});

/**
 * Update member role
 */
export const updateRole = mutation({
  args: {
    id: v.id("fleetMembers"),
    role: v.union(v.literal("admin"), v.literal("driver")),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    // Can't change owner's role
    const fleet = await ctx.db.get(member.fleetId);
    if (fleet?.ownerId === member.userId) {
      throw new Error("Cannot change fleet owner's role");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });

    // Update user's fleet role
    await ctx.db.patch(member.userId, {
      fleetRole: args.role,
    });
  },
});

/**
 * Update member status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("fleetMembers"),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("removed")
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    // Can't remove/suspend owner
    const fleet = await ctx.db.get(member.fleetId);
    if (
      fleet?.ownerId === member.userId &&
      (args.status === "removed" || args.status === "suspended")
    ) {
      throw new Error("Cannot remove or suspend fleet owner");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    // If removed, clear user's fleet association
    if (args.status === "removed") {
      await ctx.db.patch(member.userId, {
        currentFleetId: undefined,
        fleetRole: undefined,
      });
    }
  },
});

/**
 * Remove a member from a fleet
 */
export const remove = mutation({
  args: {
    id: v.id("fleetMembers"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    // Can't remove owner
    const fleet = await ctx.db.get(member.fleetId);
    if (fleet?.ownerId === member.userId) {
      throw new Error("Cannot remove fleet owner");
    }

    // Clear user's fleet association
    await ctx.db.patch(member.userId, {
      currentFleetId: undefined,
      fleetRole: undefined,
    });

    await ctx.db.delete(args.id);
  },
});
