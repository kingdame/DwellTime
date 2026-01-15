/**
 * Facility Reviews - Driver ratings and feedback
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get reviews for a facility
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("facilityReviews")
      .withIndex("by_facility", (q) => q.eq("facilityId", args.facilityId))
      .order("desc");

    const reviews = args.limit ? await q.take(args.limit) : await q.collect();

    // Enrich with user names
    const enriched = [];
    for (const review of reviews) {
      const user = await ctx.db.get(review.userId);
      enriched.push({
        ...review,
        userName: user?.name ?? "Anonymous",
      });
    }

    return enriched;
  },
});

/**
 * Get reviews by a user
 */
export const getByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilityReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get review for a specific detention event
 */
export const getByEvent = query({
  args: {
    detentionEventId: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilityReviews")
      .withIndex("by_event", (q) =>
        q.eq("detentionEventId", args.detentionEventId)
      )
      .first();
  },
});

/**
 * Get facility payment statistics
 */
export const getPaymentStats = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("facilityReviews")
      .withIndex("by_facility", (q) => q.eq("facilityId", args.facilityId))
      .collect();

    const withPaymentData = reviews.filter((r) => r.gotPaid !== undefined);

    if (withPaymentData.length === 0) {
      return {
        totalClaims: 0,
        paidClaims: 0,
        unpaidClaims: 0,
        paymentRate: null,
        avgPaymentDays: null,
        avgPaymentAmount: null,
      };
    }

    const paidReviews = withPaymentData.filter((r) => r.gotPaid === true);
    const unpaidReviews = withPaymentData.filter((r) => r.gotPaid === false);

    const avgPaymentDays =
      paidReviews.length > 0
        ? paidReviews.reduce((sum, r) => sum + (r.paymentDays ?? 0), 0) /
          paidReviews.length
        : null;

    const avgPaymentAmount =
      paidReviews.length > 0
        ? paidReviews.reduce((sum, r) => sum + (r.paymentAmount ?? 0), 0) /
          paidReviews.length
        : null;

    return {
      totalClaims: withPaymentData.length,
      paidClaims: paidReviews.length,
      unpaidClaims: unpaidReviews.length,
      paymentRate: (paidReviews.length / withPaymentData.length) * 100,
      avgPaymentDays: avgPaymentDays ? Math.round(avgPaymentDays) : null,
      avgPaymentAmount: avgPaymentAmount
        ? Math.round(avgPaymentAmount * 100) / 100
        : null,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new review
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.id("facilities"),
    detentionEventId: v.optional(v.id("detentionEvents")),
    overallRating: v.number(),
    waitTimeRating: v.optional(v.number()),
    staffRating: v.optional(v.number()),
    restroomRating: v.optional(v.number()),
    parkingRating: v.optional(v.number()),
    safetyRating: v.optional(v.number()),
    cleanlinessRating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reviewId = await ctx.db.insert("facilityReviews", args);

    // Update facility stats
    await updateFacilityStats(ctx, args.facilityId);

    return reviewId;
  },
});

/**
 * Report payment outcome
 */
export const reportPayment = mutation({
  args: {
    id: v.id("facilityReviews"),
    gotPaid: v.boolean(),
    paymentDays: v.optional(v.number()),
    paymentAmount: v.optional(v.number()),
    partialPayment: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      gotPaid: args.gotPaid,
      paymentDays: args.paymentDays,
      paymentAmount: args.paymentAmount,
      partialPayment: args.partialPayment,
      paymentReportedAt: Date.now(),
    });
  },
});

// ============================================================================
// HELPERS
// ============================================================================

async function updateFacilityStats(ctx: any, facilityId: any) {
  const reviews = await ctx.db
    .query("facilityReviews")
    .withIndex("by_facility", (q: any) => q.eq("facilityId", facilityId))
    .collect();

  if (reviews.length === 0) return;

  const avgRating =
    reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) /
    reviews.length;

  // Calculate avg wait time from detention events
  const eventIds = reviews
    .filter((r: any) => r.detentionEventId)
    .map((r: any) => r.detentionEventId);

  let avgWaitMinutes = null;
  if (eventIds.length > 0) {
    let totalWait = 0;
    let count = 0;
    for (const eventId of eventIds) {
      const event = await ctx.db.get(eventId);
      if (event) {
        const waitTime = event.departureTime
          ? (event.departureTime - event.arrivalTime) / (1000 * 60)
          : 0;
        totalWait += waitTime;
        count++;
      }
    }
    if (count > 0) {
      avgWaitMinutes = Math.round(totalWait / count);
    }
  }

  await ctx.db.patch(facilityId, {
    avgRating: Math.round(avgRating * 10) / 10,
    avgWaitMinutes,
    totalReviews: reviews.length,
  });
}
