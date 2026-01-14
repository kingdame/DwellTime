/**
 * Payment Tracking Types
 * Types for payment reliability and follow-up tracking
 */

export type PaymentResponse =
  | 'paid_full'
  | 'paid_partial'
  | 'not_paid'
  | 'pending'
  | 'disputed';

export interface FacilityPaymentStats {
  facility_id: string;
  facility_name: string;
  total_claims: number;
  paid_claims: number;
  unpaid_claims: number;
  payment_rate: number | null;
  avg_payment_days: number | null;
  avg_payment_amount: number | null;
  partial_payments: number;
  last_report_date: string | null;
}

export interface PaymentFollowUp {
  id: string;
  user_id: string;
  invoice_id: string;
  tracking_id: string | null;
  facility_id: string | null;
  scheduled_for: string;
  sent_at: string | null;
  responded_at: string | null;
  response: PaymentResponse | null;
  payment_amount: number | null;
  payment_days: number | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentFollowUpInput {
  user_id: string;
  invoice_id: string;
  tracking_id?: string;
  facility_id?: string;
  scheduled_for: string;
}

export interface PaymentReportInput {
  follow_up_id: string;
  response: PaymentResponse;
  payment_amount?: number;
  payment_days?: number;
  notes?: string;
}

export interface PaymentReliabilitySummary {
  paymentRate: number | null;
  avgDaysToPayment: number | null;
  totalClaims: number;
  reliability: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  reliabilityColor: string;
}

export const RELIABILITY_THRESHOLDS = {
  excellent: { min: 80, color: '#22C55E' },  // Green
  good: { min: 60, color: '#84CC16' },       // Lime
  fair: { min: 40, color: '#F59E0B' },       // Amber
  poor: { min: 0, color: '#EF4444' },        // Red
  unknown: { min: -1, color: '#6B7280' },    // Gray
} as const;

export function getReliabilityLevel(
  paymentRate: number | null,
  totalClaims: number
): PaymentReliabilitySummary['reliability'] {
  if (totalClaims < 3 || paymentRate === null) return 'unknown';
  if (paymentRate >= RELIABILITY_THRESHOLDS.excellent.min) return 'excellent';
  if (paymentRate >= RELIABILITY_THRESHOLDS.good.min) return 'good';
  if (paymentRate >= RELIABILITY_THRESHOLDS.fair.min) return 'fair';
  return 'poor';
}

export function getReliabilityColor(
  reliability: PaymentReliabilitySummary['reliability']
): string {
  return RELIABILITY_THRESHOLDS[reliability].color;
}
