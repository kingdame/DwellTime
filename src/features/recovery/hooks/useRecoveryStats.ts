/**
 * useRecoveryStats Hook
 * React Query hooks for recovery statistics
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import {
  fetchRecoveryStats,
  calculateROI,
} from '../services/recoveryService';
import { RecoveryStats, ROICalculation } from '@/shared/types/recovery';

const RECOVERY_STATS_KEY = ['recovery-stats'];

/**
 * Hook to fetch recovery stats
 */
export function useRecoveryStats() {
  const { user } = useAuthStore();

  return useQuery<RecoveryStats>({
    queryKey: [...RECOVERY_STATS_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return fetchRecoveryStats(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to calculate ROI based on recovery stats
 */
export function useROICalculation(
  subscriptionCost: number = 12.99
): ROICalculation | null {
  const { data: stats } = useRecoveryStats();

  if (!stats) return null;

  return calculateROI(stats, subscriptionCost);
}

/**
 * Hook for summary metrics displayed on dashboard
 */
export function useRecoverySummary() {
  const { data: stats, isLoading, error } = useRecoveryStats();

  const summary = stats
    ? {
        documented: stats.total_invoiced,
        collected: stats.total_received,
        pending: stats.pending_amount,
        collectionRate: stats.collection_rate,
        avgDaysToPayment: stats.avg_days_to_payment,
        invoiceCount: {
          total: stats.total_invoices,
          pending: stats.pending_count,
          paid: stats.paid_count,
        },
      }
    : null;

  return { summary, isLoading, error };
}

export type { RecoveryStats, ROICalculation };
