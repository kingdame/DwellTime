/**
 * Fleet Invoices - Consolidated fleet billing
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get fleet invoices
 */
export const getByFleet = query({
  args: {
    fleetId: v.id("fleets"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("partially_paid")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let invoices = await ctx.db
      .query("fleetInvoices")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .order("desc")
      .collect();

    if (args.status) {
      invoices = invoices.filter((i) => i.status === args.status);
    }

    return args.limit ? invoices.slice(0, args.limit) : invoices;
  },
});

/**
 * Get a single fleet invoice
 */
export const get = query({
  args: {
    id: v.id("fleetInvoices"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get fleet invoice by number
 */
export const getByNumber = query({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fleetInvoices")
      .withIndex("by_invoice_number", (q) =>
        q.eq("invoiceNumber", args.invoiceNumber)
      )
      .first();
  },
});

/**
 * Get fleet billing summary
 */
export const getBillingSummary = query({
  args: {
    fleetId: v.id("fleets"),
  },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("fleetInvoices")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    const draft = invoices.filter((i) => i.status === "draft");
    const sent = invoices.filter((i) => i.status === "sent");
    const paid = invoices.filter((i) => i.status === "paid");

    return {
      totalInvoices: invoices.length,
      draftCount: draft.length,
      draftAmount: draft.reduce((sum, i) => sum + i.totalAmount, 0),
      sentCount: sent.length,
      sentAmount: sent.reduce((sum, i) => sum + i.totalAmount, 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, i) => sum + i.totalAmount, 0),
      totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a consolidated fleet invoice
 */
export const create = mutation({
  args: {
    fleetId: v.id("fleets"),
    invoiceIds: v.array(v.id("invoices")),
    detentionEventIds: v.array(v.id("detentionEvents")),
    driverIds: v.array(v.id("users")),
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    dateRangeStart: v.optional(v.number()),
    dateRangeEnd: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Calculate total from detention events
    let totalAmount = 0;
    for (const eventId of args.detentionEventIds) {
      const event = await ctx.db.get(eventId);
      if (event) {
        totalAmount += event.totalAmount;
      }
    }

    // Generate invoice number
    const fleetInvoices = await ctx.db
      .query("fleetInvoices")
      .withIndex("by_fleet", (q) => q.eq("fleetId", args.fleetId))
      .collect();

    const invoiceNumber = `FLT-${String(fleetInvoices.length + 1).padStart(5, "0")}`;

    const invoiceId = await ctx.db.insert("fleetInvoices", {
      fleetId: args.fleetId,
      invoiceNumber,
      invoiceIds: args.invoiceIds,
      detentionEventIds: args.detentionEventIds,
      driverIds: args.driverIds,
      recipientName: args.recipientName,
      recipientCompany: args.recipientCompany,
      recipientEmail: args.recipientEmail,
      totalAmount,
      status: "draft",
      dateRangeStart: args.dateRangeStart,
      dateRangeEnd: args.dateRangeEnd,
      notes: args.notes,
      createdBy: args.createdBy,
    });

    return invoiceId;
  },
});

/**
 * Update fleet invoice
 */
export const update = mutation({
  args: {
    id: v.id("fleetInvoices"),
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
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
 * Set PDF URL after generation
 */
export const setPdfUrl = mutation({
  args: {
    id: v.id("fleetInvoices"),
    pdfUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      pdfUrl: args.pdfUrl,
    });
  },
});

/**
 * Mark as sent
 */
export const markSent = mutation({
  args: {
    id: v.id("fleetInvoices"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    });
  },
});

/**
 * Mark as paid
 */
export const markPaid = mutation({
  args: {
    id: v.id("fleetInvoices"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "paid",
      paidAt: Date.now(),
    });
  },
});

/**
 * Delete a draft fleet invoice
 */
export const remove = mutation({
  args: {
    id: v.id("fleetInvoices"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Fleet invoice not found");
    }

    if (invoice.status !== "draft") {
      throw new Error("Can only delete draft invoices");
    }

    await ctx.db.delete(args.id);
  },
});
