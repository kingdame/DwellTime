/**
 * useTruckEntrance Hooks
 * React Query hooks for truck entrance crowdsourcing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitTruckEntranceReport,
  confirmTruckEntrance,
  reportTruckEntranceIncorrect,
  getUserTruckEntranceReport,
  getFacilityTruckEntranceReports,
  hasUserReported,
} from '../services/truckEntranceService';
import type { TruckEntranceReportInput } from '@/shared/types/truck-entrance';

/**
 * Hook to check if user has reported on a facility
 */
export function useHasUserReported(userId: string | null, facilityId: string | null) {
  return useQuery({
    queryKey: ['truckEntrance', 'hasReported', userId, facilityId],
    queryFn: () => (userId && facilityId ? hasUserReported(userId, facilityId) : false),
    enabled: !!userId && !!facilityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get user's report for a facility
 */
export function useUserTruckEntranceReport(userId: string | null, facilityId: string | null) {
  return useQuery({
    queryKey: ['truckEntrance', 'userReport', userId, facilityId],
    queryFn: () => (userId && facilityId ? getUserTruckEntranceReport(userId, facilityId) : null),
    enabled: !!userId && !!facilityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get all reports for a facility
 */
export function useFacilityTruckEntranceReports(facilityId: string | null, limit: number = 10) {
  return useQuery({
    queryKey: ['truckEntrance', 'facilityReports', facilityId, limit],
    queryFn: () => (facilityId ? getFacilityTruckEntranceReports(facilityId, limit) : []),
    enabled: !!facilityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to submit a truck entrance report
 */
export function useSubmitTruckEntranceReport(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TruckEntranceReportInput) => {
      if (!userId) throw new Error('User not authenticated');
      return submitTruckEntranceReport(userId, input);
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['truckEntrance', 'hasReported', userId, variables.facility_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['truckEntrance', 'userReport', userId, variables.facility_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['truckEntrance', 'facilityReports', variables.facility_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'detail', variables.facility_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'withReviews', variables.facility_id],
      });
    },
  });
}

/**
 * Hook to confirm truck entrance
 */
export function useConfirmTruckEntrance(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (facilityId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return confirmTruckEntrance(userId, facilityId);
    },
    onSuccess: (_, facilityId) => {
      queryClient.invalidateQueries({
        queryKey: ['truckEntrance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'detail', facilityId],
      });
    },
  });
}

/**
 * Hook to report truck entrance as incorrect
 */
export function useReportTruckEntranceIncorrect(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ facilityId, notes }: { facilityId: string; notes?: string }) => {
      if (!userId) throw new Error('User not authenticated');
      return reportTruckEntranceIncorrect(userId, facilityId, notes);
    },
    onSuccess: (_, { facilityId }) => {
      queryClient.invalidateQueries({
        queryKey: ['truckEntrance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['facilities', 'detail', facilityId],
      });
    },
  });
}
