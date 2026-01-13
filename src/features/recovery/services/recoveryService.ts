/**
 * Recovery Service
 * Handles invoice tracking, aging calculations, and recovery stats
 */

import { supabase } from '@/shared/lib/supabase';
import {
  InvoiceTracking,
  InvoiceTrackingInput,
  InvoiceTrackingUpdate,
  RecoveryStats,
  AgingInvoice,
  AgingBucket,
  AgingBucketSummary,
  ROICalculation,
  AGING_THRESHOLDS,
  AGING_COLORS,
  AGING_LABELS,
} from '@/shared/types/recovery';

/**
 * Fetch recovery stats for a user
 */
export async function fetchRecoveryStats(
  userId: string
): Promise<RecoveryStats> {
  const { data, error } = await supabase
    .from('recovery_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch recovery stats: ${error.message}`);
  }

  // Return default stats if no data
  return (
    data || {
      total_invoices: 0,
      pending_count: 0,
      paid_count: 0,
      partial_count: 0,
      total_invoiced: 0,
      total_received: 0,
      pending_amount: 0,
      paid_amount: 0,
      collection_rate: 0,
      avg_days_to_payment: null,
    }
  );
}

/**
 * Fetch invoice tracking record
 */
export async function fetchInvoiceTracking(
  invoiceId: string
): Promise<InvoiceTracking | null> {
  const { data, error } = await supabase
    .from('invoice_tracking')
    .select('*')
    .eq('invoice_id', invoiceId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch invoice tracking: ${error.message}`);
  }

  return data;
}

/**
 * Create invoice tracking record
 */
export async function createInvoiceTracking(
  input: InvoiceTrackingInput
): Promise<InvoiceTracking> {
  const { data, error } = await supabase
    .from('invoice_tracking')
    .insert({
      ...input,
      next_reminder_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice tracking: ${error.message}`);
  }

  return data;
}

/**
 * Update invoice tracking record
 */
export async function updateInvoiceTracking(
  trackingId: string,
  updates: InvoiceTrackingUpdate
): Promise<InvoiceTracking> {
  const { data, error } = await supabase
    .from('invoice_tracking')
    .update(updates)
    .eq('id', trackingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update invoice tracking: ${error.message}`);
  }

  return data;
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(
  trackingId: string,
  amountReceived: number
): Promise<InvoiceTracking> {
  return updateInvoiceTracking(trackingId, {
    payment_status: 'paid',
    amount_received: amountReceived,
  });
}

/**
 * Mark invoice as partially paid
 */
export async function markInvoicePartialPaid(
  trackingId: string,
  amountReceived: number
): Promise<InvoiceTracking> {
  return updateInvoiceTracking(trackingId, {
    payment_status: 'partial',
    amount_received: amountReceived,
  });
}

/**
 * Calculate aging bucket from days outstanding
 */
export function calculateAgingBucket(daysOutstanding: number): AgingBucket {
  if (daysOutstanding <= AGING_THRESHOLDS.current.max) return 'current';
  if (daysOutstanding <= AGING_THRESHOLDS.aging.max) return 'aging';
  if (daysOutstanding <= AGING_THRESHOLDS.overdue.max) return 'overdue';
  return 'critical';
}

/**
 * Fetch aging invoices for a user
 */
export async function fetchAgingInvoices(
  userId: string
): Promise<AgingInvoice[]> {
  const { data, error } = await supabase
    .from('invoice_tracking')
    .select(
      `
      id,
      invoice_id,
      amount_invoiced,
      amount_received,
      payment_status,
      reminder_count,
      next_reminder_at,
      invoices (
        invoice_number,
        recipient_email,
        sent_at,
        detention_events (
          facilities (name)
        )
      )
    `
    )
    .eq('user_id', userId)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch aging invoices: ${error.message}`);
  }

  return (data || []).map((item: any) => {
    const sentAt = item.invoices?.sent_at
      ? new Date(item.invoices.sent_at)
      : new Date(item.created_at);
    const daysOutstanding = Math.floor(
      (Date.now() - sentAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: item.id,
      invoice_id: item.invoice_id,
      invoice_number: item.invoices?.invoice_number || 'N/A',
      recipient_email: item.invoices?.recipient_email,
      amount_invoiced: item.amount_invoiced,
      amount_received: item.amount_received,
      payment_status: item.payment_status,
      sent_at: item.invoices?.sent_at || item.created_at,
      days_outstanding: daysOutstanding,
      aging_bucket: calculateAgingBucket(daysOutstanding),
      facility_name:
        item.invoices?.detention_events?.[0]?.facilities?.name || null,
      reminder_count: item.reminder_count,
      next_reminder_at: item.next_reminder_at,
    };
  });
}

/**
 * Get aging bucket summaries
 */
export function calculateAgingBuckets(
  invoices: AgingInvoice[]
): AgingBucketSummary[] {
  const buckets: Record<AgingBucket, { count: number; amount: number }> = {
    current: { count: 0, amount: 0 },
    aging: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    critical: { count: 0, amount: 0 },
  };

  invoices.forEach((invoice) => {
    const bucket = invoice.aging_bucket;
    buckets[bucket].count += 1;
    buckets[bucket].amount += invoice.amount_invoiced - invoice.amount_received;
  });

  return (Object.keys(buckets) as AgingBucket[]).map((bucket) => ({
    bucket,
    label: AGING_LABELS[bucket],
    count: buckets[bucket].count,
    amount: buckets[bucket].amount,
    color: AGING_COLORS[bucket],
  }));
}

/**
 * Calculate ROI
 */
export function calculateROI(
  stats: RecoveryStats,
  subscriptionCost: number = 12.99
): ROICalculation {
  const netGain = stats.total_received - subscriptionCost;
  const roiMultiplier =
    subscriptionCost > 0 ? stats.total_received / subscriptionCost : 0;

  return {
    total_documented: stats.total_invoiced,
    total_collected: stats.total_received,
    pending_amount: stats.pending_amount,
    collection_rate: stats.collection_rate,
    subscription_cost: subscriptionCost,
    roi_multiplier: Math.round(roiMultiplier * 10) / 10,
    net_gain: Math.round(netGain * 100) / 100,
  };
}

/**
 * Increment reminder count and set next reminder
 */
export async function recordReminderSent(
  trackingId: string
): Promise<InvoiceTracking> {
  // Fetch current tracking
  const { data: current, error: fetchError } = await supabase
    .from('invoice_tracking')
    .select('reminder_count')
    .eq('id', trackingId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch tracking: ${fetchError.message}`);
  }

  const newCount = (current?.reminder_count || 0) + 1;
  // Increase interval: 7 days, then 14, then 30
  const intervalDays = newCount === 1 ? 7 : newCount === 2 ? 14 : 30;

  const { data, error } = await supabase
    .from('invoice_tracking')
    .update({
      reminder_count: newCount,
      last_reminder_at: new Date().toISOString(),
      next_reminder_at: new Date(
        Date.now() + intervalDays * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
    .eq('id', trackingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record reminder: ${error.message}`);
  }

  return data;
}

/**
 * Get invoices due for reminder
 */
export async function fetchInvoicesDueForReminder(
  userId: string
): Promise<AgingInvoice[]> {
  const { data, error } = await supabase
    .from('invoice_tracking')
    .select(
      `
      id,
      invoice_id,
      amount_invoiced,
      amount_received,
      payment_status,
      reminder_count,
      next_reminder_at,
      invoices (
        invoice_number,
        recipient_email,
        sent_at
      )
    `
    )
    .eq('user_id', userId)
    .eq('payment_status', 'pending')
    .lte('next_reminder_at', new Date().toISOString());

  if (error) {
    throw new Error(`Failed to fetch reminders due: ${error.message}`);
  }

  return (data || []).map((item: any) => {
    const sentAt = item.invoices?.sent_at
      ? new Date(item.invoices.sent_at)
      : new Date();
    const daysOutstanding = Math.floor(
      (Date.now() - sentAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: item.id,
      invoice_id: item.invoice_id,
      invoice_number: item.invoices?.invoice_number || 'N/A',
      recipient_email: item.invoices?.recipient_email,
      amount_invoiced: item.amount_invoiced,
      amount_received: item.amount_received,
      payment_status: item.payment_status,
      sent_at: item.invoices?.sent_at,
      days_outstanding: daysOutstanding,
      aging_bucket: calculateAgingBucket(daysOutstanding),
      facility_name: null,
      reminder_count: item.reminder_count,
      next_reminder_at: item.next_reminder_at,
    };
  });
}
