/**
 * Payment Stats Service
 * Handles facility payment reliability and follow-up tracking
 */

import { supabase } from '@/shared/lib/supabase';
import {
  FacilityPaymentStats,
  PaymentFollowUp,
  PaymentFollowUpInput,
  PaymentReportInput,
  PaymentReliabilitySummary,
  getReliabilityLevel,
  getReliabilityColor,
} from '@/shared/types/payment-tracking';

/**
 * Fetch payment stats for a facility
 */
export async function fetchFacilityPaymentStats(
  facilityId: string
): Promise<FacilityPaymentStats | null> {
  const { data, error } = await supabase
    .from('facility_payment_stats')
    .select('*')
    .eq('facility_id', facilityId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch payment stats: ${error.message}`);
  }

  return data;
}

/**
 * Get payment reliability summary for a facility
 */
export async function getFacilityReliability(
  facilityId: string
): Promise<PaymentReliabilitySummary> {
  const stats = await fetchFacilityPaymentStats(facilityId);

  if (!stats) {
    return {
      paymentRate: null,
      avgDaysToPayment: null,
      totalClaims: 0,
      reliability: 'unknown',
      reliabilityColor: getReliabilityColor('unknown'),
    };
  }

  const reliability = getReliabilityLevel(stats.payment_rate, stats.total_claims);

  return {
    paymentRate: stats.payment_rate,
    avgDaysToPayment: stats.avg_payment_days,
    totalClaims: stats.total_claims,
    reliability,
    reliabilityColor: getReliabilityColor(reliability),
  };
}

/**
 * Schedule a payment follow-up
 */
export async function schedulePaymentFollowUp(
  input: PaymentFollowUpInput
): Promise<PaymentFollowUp> {
  const { data, error } = await supabase
    .from('payment_follow_ups')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to schedule follow-up: ${error.message}`);
  }

  return data;
}

/**
 * Get pending follow-ups for a user
 */
export async function fetchPendingFollowUps(
  userId: string
): Promise<PaymentFollowUp[]> {
  const { data, error } = await supabase
    .from('payment_follow_ups')
    .select(`
      *,
      invoices (
        invoice_number,
        total_amount,
        detention_events (
          facilities (name)
        )
      )
    `)
    .eq('user_id', userId)
    .is('responded_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch follow-ups: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all follow-ups for a user (for history)
 */
export async function fetchAllFollowUps(
  userId: string,
  limit: number = 50
): Promise<PaymentFollowUp[]> {
  const { data, error } = await supabase
    .from('payment_follow_ups')
    .select(`
      *,
      invoices (
        invoice_number,
        total_amount
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch follow-ups: ${error.message}`);
  }

  return data || [];
}

/**
 * Record payment response from follow-up
 */
export async function recordPaymentResponse(
  input: PaymentReportInput
): Promise<PaymentFollowUp> {
  const { follow_up_id, response, payment_amount, payment_days, notes } = input;

  // Update the follow-up record
  const { data: followUp, error: followUpError } = await supabase
    .from('payment_follow_ups')
    .update({
      response,
      payment_amount,
      payment_days,
      notes,
      responded_at: new Date().toISOString(),
    })
    .eq('id', follow_up_id)
    .select()
    .single();

  if (followUpError) {
    throw new Error(`Failed to record response: ${followUpError.message}`);
  }

  // Update invoice tracking if linked
  if (followUp.tracking_id) {
    await supabase
      .from('invoice_tracking')
      .update({
        follow_up_response: response,
        follow_up_responded_at: new Date().toISOString(),
        payment_status: response === 'paid_full' ? 'paid' :
                        response === 'paid_partial' ? 'partial' :
                        response === 'disputed' ? 'disputed' : 'pending',
        amount_received: payment_amount || 0,
      })
      .eq('id', followUp.tracking_id);
  }

  // Update facility review if linked
  if (followUp.facility_id) {
    const gotPaid = response === 'paid_full' || response === 'paid_partial';
    const partialPayment = response === 'paid_partial';

    // Find or create facility review for this detention event
    const { data: invoice } = await supabase
      .from('invoices')
      .select('detention_events(id)')
      .eq('id', followUp.invoice_id)
      .single();

    const detentionEventId = invoice?.detention_events?.[0]?.id;

    if (detentionEventId) {
      // Update existing review or create payment-only record
      const { error: reviewError } = await supabase
        .from('facility_reviews')
        .upsert({
          facility_id: followUp.facility_id,
          user_id: followUp.user_id,
          detention_event_id: detentionEventId,
          got_paid: gotPaid,
          payment_days: payment_days,
          payment_amount: payment_amount,
          partial_payment: partialPayment,
          payment_reported_at: new Date().toISOString(),
        }, {
          onConflict: 'facility_id,user_id,detention_event_id',
        });

      if (reviewError) {
        console.error('Failed to update facility review:', reviewError);
      }
    }
  }

  return followUp;
}

/**
 * Mark follow-up as sent (for notification tracking)
 */
export async function markFollowUpSent(
  followUpId: string
): Promise<void> {
  const { error } = await supabase
    .from('payment_follow_ups')
    .update({
      sent_at: new Date().toISOString(),
    })
    .eq('id', followUpId);

  if (error) {
    throw new Error(`Failed to mark follow-up sent: ${error.message}`);
  }
}

/**
 * Auto-schedule follow-up when invoice is sent
 * Schedules for 14 days after invoice sent date
 */
export async function autoScheduleFollowUp(
  invoiceId: string,
  userId: string,
  trackingId?: string,
  facilityId?: string
): Promise<PaymentFollowUp | null> {
  // Check if follow-up already exists
  const { data: existing } = await supabase
    .from('payment_follow_ups')
    .select('id')
    .eq('invoice_id', invoiceId)
    .single();

  if (existing) {
    return null; // Already scheduled
  }

  // Schedule for 14 days from now
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 14);

  return schedulePaymentFollowUp({
    user_id: userId,
    invoice_id: invoiceId,
    tracking_id: trackingId,
    facility_id: facilityId,
    scheduled_for: scheduledFor.toISOString(),
  });
}

/**
 * Get facilities with best/worst payment rates
 */
export async function fetchFacilitiesByPaymentRate(
  order: 'best' | 'worst' = 'best',
  limit: number = 10
): Promise<FacilityPaymentStats[]> {
  const { data, error } = await supabase
    .from('facility_payment_stats')
    .select('*')
    .gte('total_claims', 3) // Minimum claims for reliability
    .not('payment_rate', 'is', null)
    .order('payment_rate', { ascending: order === 'worst' })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch facilities: ${error.message}`);
  }

  return data || [];
}
