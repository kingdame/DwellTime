/**
 * Detention Hooks - Convex-based detention tracking
 * Replaces detention services with real-time Convex queries
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// DETENTION EVENT QUERIES
// ============================================================================

/**
 * Get all detention events for a user
 */
export function useDetentionEvents(
  userId: Id<"users"> | undefined,
  options?: {
    status?: "active" | "completed" | "invoiced" | "paid";
    limit?: number;
  }
) {
  return useQuery(
    api.detentionEvents.list,
    userId ? { userId, status: options?.status, limit: options?.limit } : "skip"
  );
}

/**
 * Get the currently active detention event for a user
 */
export function useActiveDetentionEvent(userId: Id<"users"> | undefined) {
  return useQuery(
    api.detentionEvents.getActive,
    userId ? { userId } : "skip"
  );
}

/**
 * Get a single detention event by ID
 */
export function useDetentionEvent(eventId: Id<"detentionEvents"> | undefined) {
  return useQuery(
    api.detentionEvents.get,
    eventId ? { id: eventId } : "skip"
  );
}

/**
 * Get detention events by facility
 */
export function useDetentionEventsByFacility(
  facilityId: Id<"facilities"> | undefined,
  limit?: number
) {
  return useQuery(
    api.detentionEvents.getByFacility,
    facilityId ? { facilityId, limit } : "skip"
  );
}

/**
 * Check if user can create a new event (subscription limit check)
 */
export function useEventLimit(userId: Id<"users"> | undefined) {
  return useQuery(
    api.detentionEvents.checkEventLimit,
    userId ? { userId } : "skip"
  );
}

/**
 * Get fleet events (admin view)
 */
export function useFleetDetentionEvents(
  fleetId: Id<"fleets"> | undefined,
  options?: {
    status?: "active" | "completed" | "invoiced" | "paid";
    limit?: number;
  }
) {
  return useQuery(
    api.detentionEvents.getFleetEvents,
    fleetId ? { fleetId, status: options?.status, limit: options?.limit } : "skip"
  );
}

// ============================================================================
// DETENTION EVENT MUTATIONS
// ============================================================================

/**
 * Start a new detention event (check-in)
 */
export function useStartDetention() {
  return useMutation(api.detentionEvents.start);
}

/**
 * End a detention event (check-out)
 */
export function useEndDetention() {
  return useMutation(api.detentionEvents.end);
}

/**
 * Update an existing detention event
 */
export function useUpdateDetention() {
  return useMutation(api.detentionEvents.update);
}

/**
 * Mark event as invoiced
 */
export function useMarkDetentionInvoiced() {
  return useMutation(api.detentionEvents.markInvoiced);
}

/**
 * Mark event as paid
 */
export function useMarkDetentionPaid() {
  return useMutation(api.detentionEvents.markPaid);
}

/**
 * Delete a detention event
 */
export function useDeleteDetention() {
  return useMutation(api.detentionEvents.remove);
}

// ============================================================================
// GPS LOG QUERIES
// ============================================================================

/**
 * Get GPS logs for a detention event
 */
export function useGpsLogs(detentionEventId: Id<"detentionEvents"> | undefined) {
  return useQuery(
    api.gpsLogs.getByEvent,
    detentionEventId ? { detentionEventId } : "skip"
  );
}

/**
 * Get latest GPS log for a detention event
 */
export function useLatestGpsLog(detentionEventId: Id<"detentionEvents"> | undefined) {
  return useQuery(
    api.gpsLogs.getLatest,
    detentionEventId ? { detentionEventId } : "skip"
  );
}

// ============================================================================
// GPS LOG MUTATIONS
// ============================================================================

/**
 * Add a GPS log entry
 */
export function useAddGpsLog() {
  return useMutation(api.gpsLogs.add);
}

/**
 * Batch add GPS logs (for offline sync)
 */
export function useAddGpsLogBatch() {
  return useMutation(api.gpsLogs.addBatch);
}

// ============================================================================
// PHOTO QUERIES
// ============================================================================

/**
 * Get photos for a detention event
 */
export function usePhotos(detentionEventId: Id<"detentionEvents"> | undefined) {
  return useQuery(
    api.photos.getByEvent,
    detentionEventId ? { detentionEventId } : "skip"
  );
}

/**
 * Get photos by category
 */
export function usePhotosByCategory(
  detentionEventId: Id<"detentionEvents"> | undefined,
  category: "dock" | "bol" | "conditions" | "checkin" | "other"
) {
  return useQuery(
    api.photos.getByCategory,
    detentionEventId ? { detentionEventId, category } : "skip"
  );
}

// ============================================================================
// PHOTO MUTATIONS
// ============================================================================

/**
 * Add a photo record (after uploading to R2)
 */
export function useAddPhoto() {
  return useMutation(api.photos.add);
}

/**
 * Update photo caption
 */
export function useUpdatePhotoCaption() {
  return useMutation(api.photos.updateCaption);
}

/**
 * Delete a photo
 */
export function useDeletePhoto() {
  return useMutation(api.photos.remove);
}
