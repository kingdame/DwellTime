/**
 * useSendInvoice Hook
 * React Query hook for sending invoice emails
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendInvoiceEmail,
  fetchInvoiceEmailHistory,
  type SendInvoiceEmailInput,
  type InvoiceEmail,
} from '../services/emailService';

const INVOICES_KEY = ['invoices'];
const EMAIL_HISTORY_KEY = ['invoice-emails'];

/**
 * Hook to send an invoice email
 */
export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendInvoiceEmailInput) => sendInvoiceEmail(input),
    onSuccess: (_, variables) => {
      // Invalidate invoice queries to refresh status
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({
        queryKey: ['invoice', variables.invoiceId],
      });
      // Invalidate email history for this invoice
      queryClient.invalidateQueries({
        queryKey: [...EMAIL_HISTORY_KEY, variables.invoiceId],
      });
    },
  });
}

/**
 * Hook to fetch email history for an invoice
 */
export function useInvoiceEmailHistory(invoiceId: string | null) {
  return useQuery({
    queryKey: [...EMAIL_HISTORY_KEY, invoiceId],
    queryFn: () => (invoiceId ? fetchInvoiceEmailHistory(invoiceId) : []),
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Re-export types
export type { SendInvoiceEmailInput, InvoiceEmail };
