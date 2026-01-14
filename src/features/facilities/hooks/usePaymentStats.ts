/**
 * usePaymentStats Hook
 * React Query hooks for payment reliability tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import {
  fetchFacilityPaymentStats,
  getFacilityReliability,
  fetchPendingFollowUps,
  fetchAllFollowUps,
  recordPaymentResponse,
  autoScheduleFollowUp,
  fetchFacilitiesByPaymentRate,
} from '../services/paymentStatsService';
import type {
  FacilityPaymentStats,
  PaymentReliabilitySummary,
  PaymentFollowUp,
  PaymentReportInput,
} from '@/shared/types/payment-tracking';

const PAYMENT_STATS_KEY = ['payment-stats'];
const FOLLOW_UPS_KEY = ['payment-follow-ups'];

/**
 * Hook to fetch payment stats for a facility
 */
export function useFacilityPaymentStats(facilityId: string | null) {
  return useQuery<FacilityPaymentStats | null>({
    queryKey: [...PAYMENT_STATS_KEY, facilityId],
    queryFn: () => {
      if (!facilityId) return null;
      return fetchFacilityPaymentStats(facilityId);
    },
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get facility reliability summary
 */
export function useFacilityReliability(facilityId: string | null) {
  return useQuery<PaymentReliabilitySummary>({
    queryKey: [...PAYMENT_STATS_KEY, 'reliability', facilityId],
    queryFn: () => {
      if (!facilityId) {
        return {
          paymentRate: null,
          avgDaysToPayment: null,
          totalClaims: 0,
          reliability: 'unknown' as const,
          reliabilityColor: '#6B7280',
        };
      }
      return getFacilityReliability(facilityId);
    },
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch pending payment follow-ups
 */
export function usePendingFollowUps() {
  const { user } = useAuthStore();

  return useQuery<PaymentFollowUp[]>({
    queryKey: [...FOLLOW_UPS_KEY, 'pending', user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return fetchPendingFollowUps(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all follow-ups (history)
 */
export function useFollowUpHistory(limit: number = 50) {
  const { user } = useAuthStore();

  return useQuery<PaymentFollowUp[]>({
    queryKey: [...FOLLOW_UPS_KEY, 'history', user?.id, limit],
    queryFn: () => {
      if (!user?.id) return [];
      return fetchAllFollowUps(user.id, limit);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to record payment response
 */
export function useRecordPaymentResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentReportInput) => recordPaymentResponse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_KEY });
      queryClient.invalidateQueries({ queryKey: PAYMENT_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: ['recovery-stats'] });
    },
  });
}

/**
 * Hook to auto-schedule follow-up
 */
export function useScheduleFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      userId,
      trackingId,
      facilityId,
    }: {
      invoiceId: string;
      userId: string;
      trackingId?: string;
      facilityId?: string;
    }) => autoScheduleFollowUp(invoiceId, userId, trackingId, facilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_KEY });
    },
  });
}

/**
 * Hook to fetch top/bottom facilities by payment rate
 */
export function useFacilitiesByPaymentRate(
  order: 'best' | 'worst' = 'best',
  limit: number = 10
) {
  return useQuery<FacilityPaymentStats[]>({
    queryKey: [...PAYMENT_STATS_KEY, 'ranked', order, limit],
    queryFn: () => fetchFacilitiesByPaymentRate(order, limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get count of pending follow-ups (for badges)
 */
export function usePendingFollowUpCount(): number {
  const { data } = usePendingFollowUps();
  return data?.length || 0;
}
