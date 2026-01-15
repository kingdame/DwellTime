/**
 * Fleet Invoices Hooks - Convex-based fleet billing
 */

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get fleet invoices
 */
export function useFleetInvoices(
  fleetId: Id<"fleets"> | undefined,
  status?: "draft" | "sent" | "paid" | "partially_paid"
) {
  return useQuery(
    api.fleetInvoices.getByFleet,
    fleetId ? { fleetId, status } : "skip"
  );
}

/**
 * Get a single fleet invoice
 */
export function useFleetInvoice(invoiceId: Id<"fleetInvoices"> | undefined) {
  return useQuery(api.fleetInvoices.get, invoiceId ? { id: invoiceId } : "skip");
}

/**
 * Get fleet invoice by number
 */
export function useFleetInvoiceByNumber(invoiceNumber: string | undefined) {
  return useQuery(
    api.fleetInvoices.getByNumber,
    invoiceNumber ? { invoiceNumber } : "skip"
  );
}

/**
 * Get fleet billing summary
 */
export function useFleetBillingSummary(fleetId: Id<"fleets"> | undefined) {
  return useQuery(
    api.fleetInvoices.getBillingSummary,
    fleetId ? { fleetId } : "skip"
  );
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a fleet invoice
 */
export function useCreateFleetInvoice() {
  return useMutation(api.fleetInvoices.create);
}

/**
 * Update a fleet invoice
 */
export function useUpdateFleetInvoice() {
  return useMutation(api.fleetInvoices.update);
}

/**
 * Set PDF URL
 */
export function useSetFleetInvoicePdfUrl() {
  return useMutation(api.fleetInvoices.setPdfUrl);
}

/**
 * Mark fleet invoice as sent
 */
export function useMarkFleetInvoiceSent() {
  return useMutation(api.fleetInvoices.markSent);
}

/**
 * Mark fleet invoice as paid
 */
export function useMarkFleetInvoicePaid() {
  return useMutation(api.fleetInvoices.markPaid);
}

/**
 * Delete a fleet invoice
 */
export function useDeleteFleetInvoice() {
  return useMutation(api.fleetInvoices.remove);
}

// ============================================================================
// EMAIL ACTIONS
// ============================================================================

/**
 * Send fleet invoice email
 */
export function useSendFleetInvoiceEmail() {
  return useAction(api.email.sendFleetInvoiceEmail);
}
