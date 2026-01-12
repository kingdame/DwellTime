/**
 * useHistory Hook
 * React Query hooks for fetching detention history
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchDetentionHistory,
  fetchDetentionDetail,
  fetchHistorySummary,
  getStartOfMonth,
  type DetentionRecord,
  type HistorySummary,
  type HistoryFilters,
} from '../services/historyService';

/**
 * Hook to fetch detention history list
 */
export function useDetentionHistory(
  filters?: HistoryFilters,
  limit: number = 50,
  offset: number = 0
) {
  return useQuery({
    queryKey: ['detention-history', filters, limit, offset],
    queryFn: () => fetchDetentionHistory(filters, limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single detention record
 */
export function useDetentionDetail(id: string | null) {
  return useQuery({
    queryKey: ['detention-detail', id],
    queryFn: () => (id ? fetchDetentionDetail(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch history summary for current month
 */
export function useMonthSummary() {
  const startOfMonth = getStartOfMonth();

  return useQuery({
    queryKey: ['history-summary', 'month', startOfMonth],
    queryFn: () => fetchHistorySummary(startOfMonth),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all-time history summary
 */
export function useAllTimeSummary() {
  return useQuery({
    queryKey: ['history-summary', 'all-time'],
    queryFn: () => fetchHistorySummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Re-export types
export type { DetentionRecord, HistorySummary, HistoryFilters };
