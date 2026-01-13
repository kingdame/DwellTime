/**
 * Recovery Feature Types
 * Types for invoice tracking, aging, and recovery dashboard
 */

export type PaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'disputed'
  | 'written_off';

export type AgingBucket = 'current' | 'aging' | 'overdue' | 'critical';

export interface InvoiceTracking {
  id: string;
  invoice_id: string;
  user_id: string;
  amount_invoiced: number;
  amount_received: number;
  payment_status: PaymentStatus;
  payment_received_at: string | null;
  days_to_payment: number | null;
  reminder_count: number;
  last_reminder_at: string | null;
  next_reminder_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceTrackingInput {
  invoice_id: string;
  user_id: string;
  amount_invoiced: number;
  notes?: string;
}

export interface InvoiceTrackingUpdate {
  payment_status?: PaymentStatus;
  amount_received?: number;
  notes?: string;
  next_reminder_at?: string;
}

export interface RecoveryStats {
  total_invoices: number;
  pending_count: number;
  paid_count: number;
  partial_count: number;
  total_invoiced: number;
  total_received: number;
  pending_amount: number;
  paid_amount: number;
  collection_rate: number;
  avg_days_to_payment: number | null;
}

export interface AgingInvoice {
  id: string;
  invoice_id: string;
  invoice_number: string;
  recipient_email: string | null;
  amount_invoiced: number;
  amount_received: number;
  payment_status: PaymentStatus;
  sent_at: string;
  days_outstanding: number;
  aging_bucket: AgingBucket;
  facility_name: string | null;
  reminder_count: number;
  next_reminder_at: string | null;
}

export interface AgingBucketSummary {
  bucket: AgingBucket;
  label: string;
  count: number;
  amount: number;
  color: string;
}

export interface ROICalculation {
  total_documented: number;
  total_collected: number;
  pending_amount: number;
  collection_rate: number;
  subscription_cost: number;
  roi_multiplier: number;
  net_gain: number;
}

export const AGING_THRESHOLDS = {
  current: { min: 0, max: 14 },
  aging: { min: 15, max: 30 },
  overdue: { min: 31, max: 60 },
  critical: { min: 61, max: Infinity },
} as const;

export const AGING_COLORS: Record<AgingBucket, string> = {
  current: '#22C55E', // Green
  aging: '#F59E0B', // Yellow/Amber
  overdue: '#F97316', // Orange
  critical: '#EF4444', // Red
};

export const AGING_LABELS: Record<AgingBucket, string> = {
  current: 'Current (0-14 days)',
  aging: 'Aging (15-30 days)',
  overdue: 'Overdue (31-60 days)',
  critical: 'Critical (60+ days)',
};
