/**
 * Subscriptions - Stripe subscription management
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import Stripe from "stripe";

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

// ============================================================================
// STRIPE ACTIONS
// ============================================================================

/**
 * Price IDs for each tier (configure these in your Stripe dashboard)
 * These should be set as environment variables for production
 */
const STRIPE_PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "price_pro_annual",
  },
  small_fleet: {
    monthly: process.env.STRIPE_PRICE_SMALL_FLEET_MONTHLY || "price_small_fleet_monthly",
    annual: process.env.STRIPE_PRICE_SMALL_FLEET_ANNUAL || "price_small_fleet_annual",
  },
  fleet: {
    monthly: process.env.STRIPE_PRICE_FLEET_MONTHLY || "price_fleet_monthly",
    annual: process.env.STRIPE_PRICE_FLEET_ANNUAL || "price_fleet_annual",
  },
};

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = action({
  args: {
    userId: v.id("users"),
    tier: v.union(
      v.literal("pro"),
      v.literal("small_fleet"),
      v.literal("fleet")
    ),
    interval: v.union(v.literal("monthly"), v.literal("annual")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    // @ts-expect-error - Stripe SDK expects specific API version string
    const stripe = new Stripe(stripeSecretKey);

    // Get user from database
    const user = await ctx.runQuery(api.users.get, { id: args.userId });
    if (!user) {
      throw new Error("User not found");
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: args.userId,
        },
      });
      customerId = customer.id;

      // Store customer ID on user
      await ctx.runMutation(api.users.updateStripeCustomerId, {
        id: args.userId,
        stripeCustomerId: customerId,
      });
    }

    // Get price ID for the selected tier and interval
    const priceConfig = STRIPE_PRICE_IDS[args.tier];
    if (!priceConfig) {
      throw new Error(`Invalid tier: ${args.tier}`);
    }
    const priceId = priceConfig[args.interval];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      subscription_data: {
        metadata: {
          userId: args.userId,
          tier: args.tier,
        },
        trial_period_days: 7, // 7-day free trial
      },
      metadata: {
        userId: args.userId,
        tier: args.tier,
      },
      allow_promotion_codes: true,
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  },
});

/**
 * Create a Stripe customer portal session for managing subscription
 */
export const createCustomerPortalSession = action({
  args: {
    userId: v.id("users"),
    returnUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    // @ts-expect-error - Stripe SDK expects specific API version string
    const stripe = new Stripe(stripeSecretKey);

    // Get user's Stripe customer ID
    const user = await ctx.runQuery(api.users.get, { id: args.userId });
    if (!user?.stripeCustomerId) {
      throw new Error("No Stripe customer found for user");
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return {
      url: session.url,
    };
  },
});

// Import api for actions
import { api } from "./_generated/api";
