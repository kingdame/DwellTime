/**
 * Invoices - Invoice generation and tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all invoices for a user
 */
export const list = query({
  args: {
    userId: v.id("users"),
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
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (args.status) {
      invoices = invoices.filter((i) => i.status === args.status);
    }

    return args.limit ? invoices.slice(0, args.limit) : invoices;
  },
});

/**
 * Get a single invoice by ID
 */
export const get = query({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get invoice by invoice number
 */
export const getByNumber = query({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_invoice_number", (q) =>
        q.eq("invoiceNumber", args.invoiceNumber)
      )
      .first();
  },
});

/**
 * Get aging summary for recovery dashboard
 */
export const getAgingSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sentInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unpaid = sentInvoices.filter((i) => i.status === "sent");

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Calculate aging buckets
    const buckets = {
      current: { count: 0, amount: 0 }, // 0-30 days
      thirtyDays: { count: 0, amount: 0 }, // 31-60 days
      sixtyDays: { count: 0, amount: 0 }, // 61-90 days
      ninetyPlus: { count: 0, amount: 0 }, // 90+ days
    };

    for (const invoice of unpaid) {
      const sentAt = invoice.sentAt ?? invoice._creationTime;
      const daysOld = Math.floor((now - sentAt) / DAY);

      if (daysOld <= 30) {
        buckets.current.count++;
        buckets.current.amount += invoice.totalAmount;
      } else if (daysOld <= 60) {
        buckets.thirtyDays.count++;
        buckets.thirtyDays.amount += invoice.totalAmount;
      } else if (daysOld <= 90) {
        buckets.sixtyDays.count++;
        buckets.sixtyDays.amount += invoice.totalAmount;
      } else {
        buckets.ninetyPlus.count++;
        buckets.ninetyPlus.amount += invoice.totalAmount;
      }
    }

    const totalUnpaid = unpaid.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidInvoices = sentInvoices.filter((i) => i.status === "paid");
    const totalPaid = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      buckets,
      totalUnpaid,
      totalPaid,
      totalInvoiced: totalUnpaid + totalPaid,
      unpaidCount: unpaid.length,
      paidCount: paidInvoices.length,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new invoice
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    detentionEventIds: v.array(v.id("detentionEvents")),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),
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
    const userInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const invoiceNumber = `INV-${String(userInvoices.length + 1).padStart(5, "0")}`;

    const invoiceId = await ctx.db.insert("invoices", {
      userId: args.userId,
      invoiceNumber,
      detentionEventIds: args.detentionEventIds,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      recipientCompany: args.recipientCompany,
      totalAmount,
      status: "draft",
    });

    return invoiceId;
  },
});

/**
 * Update invoice recipient info
 */
export const update = mutation({
  args: {
    id: v.id("invoices"),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientCompany: v.optional(v.string()),
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
    id: v.id("invoices"),
    pdfUrl: v.string(),
    pdfStorageKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      pdfUrl: args.pdfUrl,
      pdfStorageKey: args.pdfStorageKey,
    });
  },
});

/**
 * Mark invoice as sent
 */
export const markSent = mutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    });

    // Mark associated detention events as invoiced
    for (const eventId of invoice.detentionEventIds) {
      await ctx.db.patch(eventId, {
        status: "invoiced",
      });
    }
  },
});

/**
 * Mark invoice as paid
 */
export const markPaid = mutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(args.id, {
      status: "paid",
      paidAt: Date.now(),
    });

    // Mark associated detention events as paid
    for (const eventId of invoice.detentionEventIds) {
      await ctx.db.patch(eventId, {
        status: "paid",
      });
    }
  },
});

/**
 * Delete a draft invoice
 */
export const remove = mutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status !== "draft") {
      throw new Error("Can only delete draft invoices");
    }

    await ctx.db.delete(args.id);
  },
});
