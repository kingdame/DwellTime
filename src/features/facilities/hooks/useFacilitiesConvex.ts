/**
 * Facilities Hooks - Convex-based facility management
 * Replaces facilityService.ts with real-time Convex queries
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// FACILITY QUERIES
// ============================================================================

/**
 * Get facility by ID
 */
export function useFacility(facilityId: Id<"facilities"> | undefined) {
  return useQuery(api.facilities.get, facilityId ? { id: facilityId } : "skip");
}

/**
 * Search facilities by name
 */
export function useSearchFacilities(query: string, limit?: number) {
  return useQuery(
    api.facilities.search,
    query ? { query, limit } : "skip"
  );
}

/**
 * Get facilities by city and state
 */
export function useFacilitiesByCityState(city: string, state: string) {
  return useQuery(
    api.facilities.getByCityState,
    city && state ? { city, state } : "skip"
  );
}

/**
 * Get facilities by type
 */
export function useFacilitiesByType(
  facilityType: "shipper" | "receiver" | "both" | "unknown",
  limit?: number
) {
  return useQuery(api.facilities.getByType, { facilityType, limit });
}

/**
 * Get nearby facilities
 */
export function useNearbyFacilities(
  lat: number | undefined,
  lng: number | undefined,
  radiusMiles?: number,
  limit?: number
) {
  return useQuery(
    api.facilities.getNearby,
    lat !== undefined && lng !== undefined
      ? { lat, lng, radiusMiles, limit }
      : "skip"
  );
}

/**
 * Get facilities with truck entrance info
 */
export function useFacilitiesWithTruckEntrance(limit?: number) {
  return useQuery(api.facilities.getWithTruckEntrance, { limit });
}

// ============================================================================
// FACILITY MUTATIONS
// ============================================================================

/**
 * Create a new facility
 */
export function useCreateFacility() {
  return useMutation(api.facilities.create);
}

/**
 * Update facility info
 */
export function useUpdateFacility() {
  return useMutation(api.facilities.update);
}

/**
 * Update truck entrance info
 */
export function useUpdateTruckEntrance() {
  return useMutation(api.facilities.updateTruckEntrance);
}

// ============================================================================
// FACILITY REVIEWS
// ============================================================================

/**
 * Get reviews for a facility
 */
export function useFacilityReviews(
  facilityId: Id<"facilities"> | undefined,
  limit?: number
) {
  return useQuery(
    api.facilityReviews.getByFacility,
    facilityId ? { facilityId, limit } : "skip"
  );
}

/**
 * Get reviews by a user
 */
export function useUserReviews(userId: Id<"users"> | undefined) {
  return useQuery(
    api.facilityReviews.getByUser,
    userId ? { userId } : "skip"
  );
}

/**
 * Get review for a specific detention event
 */
export function useEventReview(detentionEventId: Id<"detentionEvents"> | undefined) {
  return useQuery(
    api.facilityReviews.getByEvent,
    detentionEventId ? { detentionEventId } : "skip"
  );
}

/**
 * Get facility payment statistics
 */
export function useFacilityPaymentStats(facilityId: Id<"facilities"> | undefined) {
  return useQuery(
    api.facilityReviews.getPaymentStats,
    facilityId ? { facilityId } : "skip"
  );
}

// ============================================================================
// FACILITY REVIEW MUTATIONS
// ============================================================================

/**
 * Create a new review
 */
export function useCreateReview() {
  return useMutation(api.facilityReviews.create);
}

/**
 * Report payment outcome
 */
export function useReportPayment() {
  return useMutation(api.facilityReviews.reportPayment);
}
