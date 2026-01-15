/**
 * Photos - Evidence photo metadata (files stored in R2)
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all photos for a detention event
 */
export const getByEvent = query({
  args: {
    detentionEventId: v.id("detentionEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_event", (q) =>
        q.eq("detentionEventId", args.detentionEventId)
      )
      .collect();
  },
});

/**
 * Get photos by category for a detention event
 */
export const getByCategory = query({
  args: {
    detentionEventId: v.id("detentionEvents"),
    category: v.union(
      v.literal("dock"),
      v.literal("bol"),
      v.literal("conditions"),
      v.literal("checkin"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_event", (q) =>
        q.eq("detentionEventId", args.detentionEventId)
      )
      .collect();

    return photos.filter((p) => p.category === args.category);
  },
});

/**
 * Get a single photo by ID
 */
export const get = query({
  args: {
    id: v.id("photos"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a photo record (after uploading to R2)
 */
export const add = mutation({
  args: {
    detentionEventId: v.id("detentionEvents"),
    storageUrl: v.string(),
    storageKey: v.optional(v.string()),
    category: v.union(
      v.literal("dock"),
      v.literal("bol"),
      v.literal("conditions"),
      v.literal("checkin"),
      v.literal("other")
    ),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const photoId = await ctx.db.insert("photos", {
      ...args,
      timestamp: args.timestamp ?? Date.now(),
    });

    return photoId;
  },
});

/**
 * Update photo caption
 */
export const updateCaption = mutation({
  args: {
    id: v.id("photos"),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      caption: args.caption,
    });
  },
});

/**
 * Delete a photo record
 * Note: Also need to delete from R2 via action
 */
export const remove = mutation({
  args: {
    id: v.id("photos"),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found");
    }

    await ctx.db.delete(args.id);

    // Return storage key for R2 deletion
    return photo.storageKey;
  },
});
