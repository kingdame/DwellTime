/**
 * useInvoices Hook
 * React Query hooks for invoice operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInvoice,
  fetchInvoiceWithDetails,
  fetchUserInvoices,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceSummary,
  shareInvoicePdf,
  type InvoiceCreateInput,
  type InvoiceWithDetails,
} from '../services/invoiceService';
import type { Invoice } from '@/shared/types';

/**
 * Hook to fetch all invoices for current user
 */
export function useInvoices(userId: string | null, status?: Invoice['status']) {
  return useQuery({
    queryKey: ['invoices', userId, status],
    queryFn: () => (userId ? fetchUserInvoices(userId, status) : []),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single invoice with details
 */
export function useInvoiceDetails(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoices', 'detail', invoiceId],
    queryFn: () => (invoiceId ? fetchInvoiceWithDetails(invoiceId) : null),
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch invoice summary stats
 */
export function useInvoiceSummary(userId: string | null) {
  return useQuery({
    queryKey: ['invoices', 'summary', userId],
    queryFn: () => (userId ? getInvoiceSummary(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new invoice
 */
export function useCreateInvoice(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InvoiceCreateInput) => createInvoice(userId, input),
    onSuccess: (newInvoice) => {
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'summary', userId] });

      // Invalidate detention history (status changed to invoiced)
      queryClient.invalidateQueries({ queryKey: ['detention-history'] });

      // Add new invoice to cache
      queryClient.setQueryData(['invoices', 'detail', newInvoice.id], newInvoice);
    },
  });
}

/**
 * Hook to update invoice status
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      status,
    }: {
      invoiceId: string;
      status: Invoice['status'];
    }) => updateInvoiceStatus(invoiceId, status),
    onSuccess: (updatedInvoice) => {
      // Update invoice in cache
      queryClient.setQueryData(
        ['invoices', 'detail', updatedInvoice.id],
        (old: InvoiceWithDetails | undefined) =>
          old ? { ...old, ...updatedInvoice } : old
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      // If marked as paid, invalidate detention history
      if (updatedInvoice.status === 'paid') {
        queryClient.invalidateQueries({ queryKey: ['detention-history'] });
      }
    },
  });
}

/**
 * Hook to delete an invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => deleteInvoice(invoiceId),
    onSuccess: (_, invoiceId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['invoices', 'detail', invoiceId] });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      // Invalidate detention history (status reset to completed)
      queryClient.invalidateQueries({ queryKey: ['detention-history'] });
    },
  });
}

/**
 * Hook to share invoice as PDF
 */
export function useShareInvoice() {
  return useMutation({
    mutationFn: ({
      invoice,
      recipientInfo,
    }: {
      invoice: InvoiceWithDetails;
      recipientInfo?: { name?: string; company?: string; email?: string };
    }) => shareInvoicePdf(invoice, recipientInfo),
  });
}

// Re-export types
export type { InvoiceCreateInput, InvoiceWithDetails };
