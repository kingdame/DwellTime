/**
 * useFleetInvoices Hooks
 * React Query hooks for fleet invoice management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFleetInvoice,
  fetchFleetInvoices,
  fetchFleetInvoiceWithDetails,
  updateFleetInvoiceStatus,
  deleteFleetInvoice,
  getFleetInvoiceSummary,
  type FleetInvoice,
  type FleetInvoiceWithDetails,
  type FleetInvoiceStatus,
  type CreateFleetInvoiceInput,
} from '../services';
import { fleetEventKeys } from './useFleetEvents';

// Query keys for fleet invoice operations
export const fleetInvoiceKeys = {
  all: ['fleet-invoices'] as const,
  lists: () => [...fleetInvoiceKeys.all, 'list'] as const,
  list: (fleetId: string, status?: FleetInvoiceStatus) =>
    [...fleetInvoiceKeys.lists(), fleetId, { status }] as const,
  details: () => [...fleetInvoiceKeys.all, 'detail'] as const,
  detail: (invoiceId: string) => [...fleetInvoiceKeys.details(), invoiceId] as const,
  summary: (fleetId: string) => [...fleetInvoiceKeys.all, 'summary', fleetId] as const,
};

/**
 * Hook to fetch fleet invoices with optional status filter
 */
export function useFleetInvoices(fleetId: string | null, status?: FleetInvoiceStatus) {
  return useQuery({
    queryKey: fleetInvoiceKeys.list(fleetId || '', status),
    queryFn: () => (fleetId ? fetchFleetInvoices(fleetId, status) : []),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single fleet invoice with full details
 */
export function useFleetInvoiceDetails(invoiceId: string | null) {
  return useQuery({
    queryKey: fleetInvoiceKeys.detail(invoiceId || ''),
    queryFn: () => (invoiceId ? fetchFleetInvoiceWithDetails(invoiceId) : null),
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch fleet invoice summary statistics
 */
export function useFleetInvoiceSummary(fleetId: string | null) {
  return useQuery({
    queryKey: fleetInvoiceKeys.summary(fleetId || ''),
    queryFn: () => (fleetId ? getFleetInvoiceSummary(fleetId) : null),
    enabled: !!fleetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a consolidated fleet invoice
 */
export function useCreateFleetInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fleetId,
      input,
    }: {
      fleetId: string;
      input: CreateFleetInvoiceInput;
    }) => createFleetInvoice(fleetId, input),
    onSuccess: (newInvoice, { fleetId }) => {
      // Invalidate fleet invoices list
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.lists(),
      });

      // Invalidate fleet invoice summary
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.summary(fleetId),
      });

      // Invalidate fleet summary (invoice counts changed)
      queryClient.invalidateQueries({ queryKey: fleetEventKeys.summary(fleetId) });

      // Invalidate individual invoices list (member invoices now consolidated)
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      // Add new invoice to cache
      queryClient.setQueryData(fleetInvoiceKeys.detail(newInvoice.id), newInvoice);
    },
  });
}

/**
 * Hook to update fleet invoice status
 */
export function useUpdateFleetInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      status,
    }: {
      invoiceId: string;
      status: FleetInvoiceStatus;
      fleetId: string;
    }) => updateFleetInvoiceStatus(invoiceId, status),
    onSuccess: (updatedInvoice, { fleetId }) => {
      // Update invoice in cache
      queryClient.setQueryData(
        fleetInvoiceKeys.detail(updatedInvoice.id),
        (old: FleetInvoiceWithDetails | undefined) =>
          old ? { ...old, ...updatedInvoice } : old
      );

      // Invalidate invoice lists
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.lists(),
      });

      // Invalidate fleet invoice summary
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.summary(fleetId),
      });

      // Invalidate fleet summary
      queryClient.invalidateQueries({ queryKey: fleetEventKeys.summary(fleetId) });

      // If marked as paid, invalidate underlying member invoices
      if (updatedInvoice.status === 'paid') {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['detention-history'] });
      }
    },
  });
}

/**
 * Hook to delete a fleet invoice (draft only)
 */
export function useDeleteFleetInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
    }: {
      invoiceId: string;
      fleetId: string;
    }) => deleteFleetInvoice(invoiceId),
    onSuccess: (_, { invoiceId, fleetId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: fleetInvoiceKeys.detail(invoiceId) });

      // Invalidate invoice lists
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.lists(),
      });

      // Invalidate fleet invoice summary
      queryClient.invalidateQueries({
        queryKey: fleetInvoiceKeys.summary(fleetId),
      });

      // Invalidate fleet summary
      queryClient.invalidateQueries({ queryKey: fleetEventKeys.summary(fleetId) });

      // Invalidate individual invoices (they are now unconsolidated)
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Re-export types for convenience
export type {
  FleetInvoice,
  FleetInvoiceWithDetails,
  FleetInvoiceStatus,
  CreateFleetInvoiceInput,
};
