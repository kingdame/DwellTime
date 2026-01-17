/**
 * Invoice Hooks - Convex-based invoice management
 * Replaces invoiceService.ts with real-time Convex queries
 */

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// INVOICE QUERIES
// ============================================================================

/**
 * Get all invoices for a user
 */
export function useInvoices(
  userId: Id<"users"> | undefined,
  options?: {
    status?: "draft" | "sent" | "paid" | "partially_paid";
    limit?: number;
  }
) {
  return useQuery(
    api.invoices.list,
    userId ? { userId, status: options?.status, limit: options?.limit } : "skip"
  );
}

/**
 * Get a single invoice by ID
 */
export function useInvoice(invoiceId: Id<"invoices"> | undefined) {
  return useQuery(api.invoices.get, invoiceId ? { id: invoiceId } : "skip");
}

/**
 * Get invoice by invoice number
 */
export function useInvoiceByNumber(invoiceNumber: string | undefined) {
  return useQuery(
    api.invoices.getByNumber,
    invoiceNumber ? { invoiceNumber } : "skip"
  );
}

/**
 * Get aging summary for recovery dashboard
 */
export function useAgingSummary(userId: Id<"users"> | undefined) {
  return useQuery(
    api.invoices.getAgingSummary,
    userId ? { userId } : "skip"
  );
}

/**
 * Get invoice summary (calculates from invoices list)
 * Returns summary data with totals by status
 */
export function useInvoiceSummary(userId: Id<"users"> | string | undefined) {
  const invoices = useInvoices(userId as Id<"users"> | undefined);
  
  if (!invoices) return undefined;
  
  // Calculate summary from invoices
  const draft = invoices.filter(i => i.status === 'draft');
  const sent = invoices.filter(i => i.status === 'sent');
  const paid = invoices.filter(i => i.status === 'paid');
  
  return {
    totalDraft: draft.length,
    totalSent: sent.length,
    totalPaid: paid.length,
    amountDraft: draft.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    amountSent: sent.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    amountPaid: paid.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };
}

// ============================================================================
// INVOICE MUTATIONS
// ============================================================================

/**
 * Create a new invoice
 */
export function useCreateInvoice() {
  return useMutation(api.invoices.create);
}

/**
 * Update invoice recipient info
 */
export function useUpdateInvoice() {
  return useMutation(api.invoices.update);
}

/**
 * Set PDF URL after generation
 */
export function useSetInvoicePdfUrl() {
  return useMutation(api.invoices.setPdfUrl);
}

/**
 * Mark invoice as sent
 */
export function useMarkInvoiceSent() {
  return useMutation(api.invoices.markSent);
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoicePaid() {
  return useMutation(api.invoices.markPaid);
}

/**
 * Delete a draft invoice
 */
export function useDeleteInvoice() {
  return useMutation(api.invoices.remove);
}

// ============================================================================
// EMAIL CONTACTS
// ============================================================================

/**
 * Get all contacts for a user
 */
export function useEmailContacts(userId: Id<"users"> | undefined) {
  return useQuery(
    api.emailContacts.getByUser,
    userId ? { userId } : "skip"
  );
}

/**
 * Get most-used contacts
 */
export function useMostUsedContacts(
  userId: Id<"users"> | undefined,
  limit?: number
) {
  return useQuery(
    api.emailContacts.getMostUsed,
    userId ? { userId, limit } : "skip"
  );
}

/**
 * Search contacts
 */
export function useSearchContacts(
  userId: Id<"users"> | undefined,
  query: string
) {
  return useQuery(
    api.emailContacts.search,
    userId && query ? { userId, query } : "skip"
  );
}

/**
 * Create or update a contact
 */
export function useUpsertContact() {
  return useMutation(api.emailContacts.upsert);
}

/**
 * Update a contact
 */
export function useUpdateContact() {
  return useMutation(api.emailContacts.update);
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  return useMutation(api.emailContacts.remove);
}

// ============================================================================
// R2 STORAGE ACTIONS
// ============================================================================

/**
 * Get upload URL for invoice PDF
 */
export function useGetUploadUrl() {
  return useAction(api.r2.getUploadUrl);
}

/**
 * Get download URL for invoice PDF
 */
export function useGetDownloadUrl() {
  return useAction(api.r2.getDownloadUrl);
}
