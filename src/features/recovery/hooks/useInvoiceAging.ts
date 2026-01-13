/**
 * useInvoiceAging Hook
 * React Query hooks for invoice aging and tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import {
  fetchAgingInvoices,
  calculateAgingBuckets,
  markInvoicePaid,
  markInvoicePartialPaid,
  updateInvoiceTracking,
  recordReminderSent,
  fetchInvoicesDueForReminder,
} from '../services/recoveryService';
import {
  AgingInvoice,
  AgingBucketSummary,
  InvoiceTrackingUpdate,
  PaymentStatus,
} from '@/shared/types/recovery';

const AGING_INVOICES_KEY = ['aging-invoices'];
const REMINDERS_DUE_KEY = ['reminders-due'];

/**
 * Hook to fetch aging invoices
 */
export function useAgingInvoices() {
  const { user } = useAuthStore();

  return useQuery<AgingInvoice[]>({
    queryKey: [...AGING_INVOICES_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return fetchAgingInvoices(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get aging bucket summaries
 */
export function useAgingBuckets(): AgingBucketSummary[] {
  const { data: invoices } = useAgingInvoices();

  if (!invoices || invoices.length === 0) {
    return [];
  }

  return calculateAgingBuckets(invoices);
}

/**
 * Hook to mark invoice as paid
 */
export function useMarkPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackingId,
      amountReceived,
    }: {
      trackingId: string;
      amountReceived: number;
    }) => markInvoicePaid(trackingId, amountReceived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGING_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: ['recovery-stats'] });
    },
  });
}

/**
 * Hook to mark invoice as partially paid
 */
export function useMarkPartialPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackingId,
      amountReceived,
    }: {
      trackingId: string;
      amountReceived: number;
    }) => markInvoicePartialPaid(trackingId, amountReceived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGING_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: ['recovery-stats'] });
    },
  });
}

/**
 * Hook to update invoice tracking status
 */
export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackingId,
      updates,
    }: {
      trackingId: string;
      updates: InvoiceTrackingUpdate;
    }) => updateInvoiceTracking(trackingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGING_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: ['recovery-stats'] });
    },
  });
}

/**
 * Hook to record that a reminder was sent
 */
export function useRecordReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackingId: string) => recordReminderSent(trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGING_INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: REMINDERS_DUE_KEY });
    },
  });
}

/**
 * Hook to fetch invoices due for reminder
 */
export function useRemindersDue() {
  const { user } = useAuthStore();

  return useQuery<AgingInvoice[]>({
    queryKey: [...REMINDERS_DUE_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return fetchInvoicesDueForReminder(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to filter aging invoices by bucket
 */
export function useAgingInvoicesByBucket(bucket: PaymentStatus | 'all') {
  const { data: invoices, isLoading, error } = useAgingInvoices();

  const filtered =
    bucket === 'all'
      ? invoices
      : invoices?.filter((inv) => inv.aging_bucket === bucket);

  return { data: filtered || [], isLoading, error };
}

export type { AgingInvoice, AgingBucketSummary };
