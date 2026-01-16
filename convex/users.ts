/**
 * Users - User profile queries and mutations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user by ID
 */
export const get = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get user by Clerk ID - Primary lookup for authenticated users
 */
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Get user by email
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Get user by Stripe customer ID
 */
export const getByStripeCustomerId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new user with Clerk ID
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    gracePeriodMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Clerk ID
    const existingByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerkId) {
      throw new Error("User with this Clerk ID already exists");
    }

    // Check if user already exists by email
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      phone: args.phone,
      companyName: args.companyName,
      hourlyRate: args.hourlyRate ?? 75,
      gracePeriodMinutes: args.gracePeriodMinutes ?? 120,
      subscriptionTier: "free",
    });

    return userId;
  },
});

/**
 * Get or create user by Clerk ID
 * Used during sign-in to ensure user profile exists
 */
export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing user by Clerk ID
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      hourlyRate: 75,
      gracePeriodMinutes: 120,
      subscriptionTier: "free",
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Update user profile
 */
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    gracePeriodMinutes: v.optional(v.number()),
    invoiceLogoUrl: v.optional(v.string()),
    invoiceTerms: v.optional(v.string()),
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
 * Update user's Stripe customer ID
 */
export const updateStripeCustomerId = mutation({
  args: {
    id: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

/**
 * Update user's subscription tier
 */
export const updateSubscription = mutation({
  args: {
    id: v.id("users"),
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("small_fleet"),
      v.literal("fleet"),
      v.literal("enterprise")
    ),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("trialing"),
        v.literal("active"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("unpaid")
      )
    ),
    subscriptionPeriodEnd: v.optional(v.number()),
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
 * Set user's current fleet
 */
export const setCurrentFleet = mutation({
  args: {
    id: v.id("users"),
    fleetId: v.optional(v.id("fleets")),
    fleetRole: v.optional(v.union(v.literal("admin"), v.literal("driver"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      currentFleetId: args.fleetId,
      fleetRole: args.fleetRole,
    });
  },
});
