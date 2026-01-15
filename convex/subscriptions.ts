/**
 * Subscriptions - Stripe subscription management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get subscription for a user
 */
export const getByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get subscription by Stripe subscription ID
 */
export const getByStripeId = query({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new subscription record
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("small_fleet"),
      v.literal("fleet"),
      v.literal("enterprise")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete")
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        tier: args.tier,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        trialEnd: args.trialEnd,
        cancelAtPeriodEnd: false,
      });

      return existing._id;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      tier: args.tier,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      trialEnd: args.trialEnd,
      cancelAtPeriodEnd: false,
    });

    // Update user's subscription tier
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status,
      subscriptionPeriodEnd: args.currentPeriodEnd,
    });

    return subscriptionId;
  },
});

/**
 * Update subscription status
 */
export const update = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    tier: v.optional(
      v.union(
        v.literal("free"),
        v.literal("pro"),
        v.literal("small_fleet"),
        v.literal("fleet"),
        v.literal("enterprise")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due"),
        v.literal("trialing"),
        v.literal("incomplete")
      )
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const { stripeSubscriptionId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(subscription._id, cleanUpdates);

    // Update user's subscription info
    const userUpdates: Record<string, unknown> = {};
    if (updates.tier) userUpdates.subscriptionTier = updates.tier;
    if (updates.status) userUpdates.subscriptionStatus = updates.status;
    if (updates.currentPeriodEnd)
      userUpdates.subscriptionPeriodEnd = updates.currentPeriodEnd;

    if (Object.keys(userUpdates).length > 0) {
      await ctx.db.patch(subscription.userId, userUpdates);
    }
  },
});

/**
 * Cancel a subscription
 */
export const cancel = mutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(subscription._id, {
      status: "canceled",
      cancelAtPeriodEnd: true,
    });

    // Downgrade user to free tier
    await ctx.db.patch(subscription.userId, {
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
    });
  },
});
