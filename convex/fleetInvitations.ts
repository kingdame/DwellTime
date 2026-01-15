/**
 * Fleet Invitations - Driver invitation management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate a random invitation code
 */
function generateInvitationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all pending invitations for a fleet
 */
export const getByFleet = query({
  args: {
    fleetId: v.id("fleets"),
  },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    // Filter to only pending (not accepted, not expired)
    const now = Date.now();
    return invitations.filter((i) => !i.acceptedAt && i.expiresAt > now);
  },
});

/**
 * Get invitation by code
 */
export const getByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_code", (q) => q.eq("invitationCode", args.code))
      .first();

    if (!invitation) {
      return null;
    }

    // Check if valid
    const now = Date.now();
    if (invitation.acceptedAt || invitation.expiresAt < now) {
      return { ...invitation, isValid: false };
    }

    // Get fleet info
    const fleet = await ctx.db.get(invitation.fleetId);

    return {
      ...invitation,
      isValid: true,
      fleet: fleet
        ? {
            name: fleet.name,
            companyName: fleet.companyName,
          }
        : null,
    };
  },
});

/**
 * Get invitations for a user's email
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();

    // Filter to only valid invitations
    const now = Date.now();
    const valid = invitations.filter((i) => !i.acceptedAt && i.expiresAt > now);

    // Enrich with fleet info
    const enriched = [];
    for (const invitation of valid) {
      const fleet = await ctx.db.get(invitation.fleetId);
      enriched.push({
        ...invitation,
        fleet: fleet
          ? {
              name: fleet.name,
              companyName: fleet.companyName,
            }
          : null,
      });
    }

    return enriched;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new invitation
 */
export const create = mutation({
  args: {
    fleetId: v.id("fleets"),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("driver")),
    invitedBy: v.id("users"),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if invitation already exists for this email
    const existing = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();

    const pendingForFleet = existing.find(
      (i) =>
        i.fleetId === args.fleetId && !i.acceptedAt && i.expiresAt > Date.now()
    );

    if (pendingForFleet) {
      throw new Error("An invitation for this email already exists");
    }

    // Check if user is already a member
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();

    if (users.length > 0) {
      const membership = await ctx.db
        .query("fleetMembers")
        .withIndex("by_fleet_user", (q) =>
          q.eq("fleetId", args.fleetId).eq("userId", users[0]._id)
        )
        .first();

      if (membership && membership.status === "active") {
        throw new Error("User is already a member of this fleet");
      }
    }

    // Generate unique code
    let code = generateInvitationCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await ctx.db
        .query("fleetInvitations")
        .withIndex("by_code", (q) => q.eq("invitationCode", code))
        .first();

      if (!existingCode) break;
      code = generateInvitationCode();
      attempts++;
    }

    const expiresAt =
      Date.now() + (args.expiresInDays ?? 7) * 24 * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("fleetInvitations", {
      fleetId: args.fleetId,
      email: args.email.toLowerCase(),
      phone: args.phone,
      invitationCode: code,
      role: args.role,
      invitedBy: args.invitedBy,
      expiresAt,
    });

    return { id: invitationId, code };
  },
});

/**
 * Accept an invitation
 */
export const accept = mutation({
  args: {
    code: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("fleetInvitations")
      .withIndex("by_code", (q) => q.eq("invitationCode", args.code))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.acceptedAt) {
      throw new Error("Invitation has already been accepted");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("Invitation has expired");
    }

    // Check if already a member
    const existing = await ctx.db
      .query("fleetMembers")
      .withIndex("by_fleet_user", (q) =>
        q.eq("fleetId", invitation.fleetId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      if (existing.status === "active") {
        throw new Error("You are already a member of this fleet");
      }
      // Reactivate membership
      await ctx.db.patch(existing._id, {
        status: "active",
        joinedAt: Date.now(),
      });
    } else {
      // Create membership
      await ctx.db.insert("fleetMembers", {
        fleetId: invitation.fleetId,
        userId: args.userId,
        role: invitation.role,
        status: "active",
        invitedBy: invitation.invitedBy,
        invitedAt: invitation._creationTime,
        joinedAt: Date.now(),
      });
    }

    // Update user's fleet association
    await ctx.db.patch(args.userId, {
      currentFleetId: invitation.fleetId,
      fleetRole: invitation.role,
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      acceptedAt: Date.now(),
    });

    return invitation.fleetId;
  },
});

/**
 * Resend an invitation (generate new code, extend expiry)
 */
export const resend = mutation({
  args: {
    id: v.id("fleetInvitations"),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.acceptedAt) {
      throw new Error("Invitation has already been accepted");
    }

    // Generate new code
    const code = generateInvitationCode();
    const expiresAt =
      Date.now() + (args.expiresInDays ?? 7) * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.id, {
      invitationCode: code,
      expiresAt,
    });

    return code;
  },
});

/**
 * Cancel an invitation
 */
export const cancel = mutation({
  args: {
    id: v.id("fleetInvitations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
