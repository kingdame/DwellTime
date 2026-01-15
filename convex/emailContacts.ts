/**
 * Email Contacts - Quick-send contact management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all contacts for a user
 */
export const getByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get most-used contacts for a user
 */
export const getMostUsed = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("emailContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by use count descending
    contacts.sort((a, b) => b.useCount - a.useCount);

    return args.limit ? contacts.slice(0, args.limit) : contacts;
  },
});

/**
 * Search contacts by email or name
 */
export const search = query({
  args: {
    userId: v.id("users"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase();

    const contacts = await ctx.db
      .query("emailContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return contacts.filter(
      (c) =>
        c.email.toLowerCase().includes(searchQuery) ||
        c.name?.toLowerCase().includes(searchQuery) ||
        c.company?.toLowerCase().includes(searchQuery)
    );
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create or update a contact
 */
export const upsert = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    contactType: v.optional(
      v.union(
        v.literal("broker"),
        v.literal("shipper"),
        v.literal("dispatcher"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if contact exists
    const existing = await ctx.db
      .query("emailContacts")
      .withIndex("by_user_email", (q) =>
        q.eq("userId", args.userId).eq("email", args.email.toLowerCase())
      )
      .first();

    if (existing) {
      // Update existing contact
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        company: args.company ?? existing.company,
        contactType: args.contactType ?? existing.contactType,
        useCount: existing.useCount + 1,
        lastUsedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new contact
    return await ctx.db.insert("emailContacts", {
      userId: args.userId,
      email: args.email.toLowerCase(),
      name: args.name,
      company: args.company,
      contactType: args.contactType,
      useCount: 1,
      lastUsedAt: Date.now(),
    });
  },
});

/**
 * Increment use count (when sending to this contact)
 */
export const incrementUseCount = mutation({
  args: {
    id: v.id("emailContacts"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    await ctx.db.patch(args.id, {
      useCount: contact.useCount + 1,
      lastUsedAt: Date.now(),
    });
  },
});

/**
 * Update a contact
 */
export const update = mutation({
  args: {
    id: v.id("emailContacts"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    contactType: v.optional(
      v.union(
        v.literal("broker"),
        v.literal("shipper"),
        v.literal("dispatcher"),
        v.literal("other")
      )
    ),
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
 * Delete a contact
 */
export const remove = mutation({
  args: {
    id: v.id("emailContacts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
