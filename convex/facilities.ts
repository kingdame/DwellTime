/**
 * Facilities - Shipper/receiver location queries and mutations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get facility by ID
 */
export const get = query({
  args: {
    id: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Search facilities by name
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase();

    // Get all facilities and filter (Convex doesn't have LIKE queries)
    const facilities = await ctx.db.query("facilities").collect();

    const filtered = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery) ||
        f.city?.toLowerCase().includes(searchQuery) ||
        f.address?.toLowerCase().includes(searchQuery)
    );

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

/**
 * Get facilities by city and state
 */
export const getByCityState = query({
  args: {
    city: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilities")
      .withIndex("by_city_state", (q) =>
        q.eq("city", args.city).eq("state", args.state)
      )
      .collect();
  },
});

/**
 * Get facilities by type
 */
export const getByType = query({
  args: {
    facilityType: v.union(
      v.literal("shipper"),
      v.literal("receiver"),
      v.literal("both"),
      v.literal("unknown")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("facilities")
      .withIndex("by_type", (q) => q.eq("facilityType", args.facilityType));

    return args.limit ? await q.take(args.limit) : await q.collect();
  },
});

/**
 * Find nearby facilities (simple distance calculation)
 * For production, consider using a geospatial service
 */
export const getNearby = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radiusMiles: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radiusMiles = args.radiusMiles ?? 50;
    const facilities = await ctx.db.query("facilities").collect();

    // Calculate distance using Haversine formula
    const withDistance = facilities.map((f) => {
      const R = 3959; // Earth's radius in miles
      const dLat = ((f.lat - args.lat) * Math.PI) / 180;
      const dLng = ((f.lng - args.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((args.lat * Math.PI) / 180) *
          Math.cos((f.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return { ...f, distance };
    });

    // Filter by radius and sort by distance
    const nearby = withDistance
      .filter((f) => f.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    return args.limit ? nearby.slice(0, args.limit) : nearby;
  },
});

/**
 * Get facilities with truck entrance info
 */
export const getWithTruckEntrance = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const facilities = await ctx.db.query("facilities").collect();

    const withEntrance = facilities.filter((f) => f.truckEntranceDifferent);

    return args.limit ? withEntrance.slice(0, args.limit) : withEntrance;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new facility
 */
export const create = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    facilityType: v.union(
      v.literal("shipper"),
      v.literal("receiver"),
      v.literal("both"),
      v.literal("unknown")
    ),
  },
  handler: async (ctx, args) => {
    const facilityId = await ctx.db.insert("facilities", {
      ...args,
      totalReviews: 0,
    });

    return facilityId;
  },
});

/**
 * Update facility info
 */
export const update = mutation({
  args: {
    id: v.id("facilities"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    facilityType: v.optional(
      v.union(
        v.literal("shipper"),
        v.literal("receiver"),
        v.literal("both"),
        v.literal("unknown")
      )
    ),
    // Amenities
    overnightParking: v.optional(v.boolean()),
    parkingSpaces: v.optional(v.number()),
    restrooms: v.optional(v.boolean()),
    driverLounge: v.optional(v.boolean()),
    waterAvailable: v.optional(v.boolean()),
    vendingMachines: v.optional(v.boolean()),
    wifiAvailable: v.optional(v.boolean()),
    showersAvailable: v.optional(v.boolean()),
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
 * Update facility stats (called after reviews)
 */
export const updateStats = mutation({
  args: {
    id: v.id("facilities"),
    avgWaitMinutes: v.optional(v.number()),
    avgRating: v.optional(v.number()),
    totalReviews: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, updates);
  },
});

/**
 * Update truck entrance info (crowdsourced)
 */
export const updateTruckEntrance = mutation({
  args: {
    id: v.id("facilities"),
    truckEntranceDifferent: v.boolean(),
    truckEntranceAddress: v.optional(v.string()),
    truckEntranceLat: v.optional(v.number()),
    truckEntranceLng: v.optional(v.number()),
    truckEntranceNotes: v.optional(v.string()),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.id);
    if (!facility) {
      throw new Error("Facility not found");
    }

    await ctx.db.patch(args.id, {
      truckEntranceDifferent: args.truckEntranceDifferent,
      truckEntranceAddress: args.truckEntranceAddress,
      truckEntranceLat: args.truckEntranceLat,
      truckEntranceLng: args.truckEntranceLng,
      truckEntranceNotes: args.truckEntranceNotes,
      truckEntranceVerifiedCount: (facility.truckEntranceVerifiedCount ?? 0) + 1,
      truckEntranceLastUpdatedAt: Date.now(),
      truckEntranceLastUpdatedBy: args.updatedBy,
    });
  },
});

// ============================================================================
// SAVED FACILITIES
// ============================================================================

/**
 * Get saved facilities for a user
 */
export const getSavedFacilities = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("savedFacilities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc"); // Most recently saved first

    const results = args.limit ? await q.take(args.limit) : await q.collect();
    return results;
  },
});

/**
 * Check if a facility is saved by a user
 */
export const isFacilitySaved = query({
  args: {
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),
    googlePlaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.facilityId) {
      const saved = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_facility", (q) =>
          q.eq("userId", args.userId).eq("facilityId", args.facilityId)
        )
        .first();
      return saved !== null;
    }

    if (args.googlePlaceId) {
      const saved = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_google_place", (q) =>
          q.eq("userId", args.userId).eq("googlePlaceId", args.googlePlaceId)
        )
        .first();
      return saved !== null;
    }

    return false;
  },
});

/**
 * Save a facility (from Convex DB or Google Places)
 */
export const saveFacility = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),
    googlePlaceId: v.optional(v.string()),
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    lat: v.number(),
    lng: v.number(),
    facilityType: v.optional(
      v.union(
        v.literal("shipper"),
        v.literal("receiver"),
        v.literal("both"),
        v.literal("unknown")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already saved
    if (args.facilityId) {
      const existing = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_facility", (q) =>
          q.eq("userId", args.userId).eq("facilityId", args.facilityId)
        )
        .first();

      if (existing) {
        // Update notes if provided
        if (args.notes !== undefined) {
          await ctx.db.patch(existing._id, { notes: args.notes });
        }
        return existing._id;
      }
    }

    if (args.googlePlaceId) {
      const existing = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_google_place", (q) =>
          q.eq("userId", args.userId).eq("googlePlaceId", args.googlePlaceId)
        )
        .first();

      if (existing) {
        // Update notes if provided
        if (args.notes !== undefined) {
          await ctx.db.patch(existing._id, { notes: args.notes });
        }
        return existing._id;
      }
    }

    // Create new saved facility
    const savedId = await ctx.db.insert("savedFacilities", {
      userId: args.userId,
      facilityId: args.facilityId,
      googlePlaceId: args.googlePlaceId,
      name: args.name,
      address: args.address,
      city: args.city,
      state: args.state,
      lat: args.lat,
      lng: args.lng,
      facilityType: args.facilityType,
      notes: args.notes,
      savedAt: Date.now(),
    });

    return savedId;
  },
});

/**
 * Remove a saved facility
 */
export const unsaveFacility = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),
    googlePlaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let saved = null;

    if (args.facilityId) {
      saved = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_facility", (q) =>
          q.eq("userId", args.userId).eq("facilityId", args.facilityId)
        )
        .first();
    } else if (args.googlePlaceId) {
      saved = await ctx.db
        .query("savedFacilities")
        .withIndex("by_user_google_place", (q) =>
          q.eq("userId", args.userId).eq("googlePlaceId", args.googlePlaceId)
        )
        .first();
    }

    if (saved) {
      await ctx.db.delete(saved._id);
      return true;
    }

    return false;
  },
});

/**
 * Update notes on a saved facility
 */
export const updateSavedFacilityNotes = mutation({
  args: {
    savedFacilityId: v.id("savedFacilities"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.savedFacilityId, {
      notes: args.notes,
    });
  },
});
