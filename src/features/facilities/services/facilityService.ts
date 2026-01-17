/**
 * Facility Service
 * Utility functions for facility data
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.facilities.list) - Get all facilities
 * - useQuery(api.facilities.search, { query }) - Search facilities
 * - useQuery(api.facilities.getNearby, { lat, lng, radius }) - Nearby facilities
 */

import type { Facility } from '@/shared/types';

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Sort facilities by distance from a point
 */
export function sortByDistance(
  facilities: Facility[],
  lat: number,
  lng: number
): (Facility & { distance: number })[] {
  return facilities
    .map(facility => ({
      ...facility,
      distance: calculateDistance(lat, lng, facility.lat, facility.lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter facilities within a radius
 */
export function filterByRadius(
  facilities: Facility[],
  lat: number,
  lng: number,
  radiusMiles: number
): Facility[] {
  return facilities.filter(facility => {
    const distance = calculateDistance(lat, lng, facility.lat, facility.lng);
    return distance <= radiusMiles;
  });
}

/**
 * Format facility address
 */
export function formatFacilityAddress(facility: Facility): string {
  const parts = [
    facility.address,
    facility.city,
    facility.state,
    facility.zip,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return 'Nearby';
  }
  if (miles < 1) {
    return `${Math.round(miles * 10) / 10} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Format average wait time
 */
export function formatWaitTime(minutes: number | null | undefined): string {
  if (!minutes) return 'No data';
  
  if (minutes < 60) {
    return `${minutes} min avg`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h avg`;
  }
  return `${hours}h ${mins}m avg`;
}

/**
 * Format rating
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating) return 'No reviews';
  return `${rating.toFixed(1)} / 5`;
}

/**
 * Get facility type display label
 */
export function getFacilityTypeLabel(type: Facility['facilityType']): string {
  switch (type) {
    case 'shipper':
      return 'Shipper';
    case 'receiver':
      return 'Receiver';
    case 'both':
      return 'Shipper/Receiver';
    default:
      return 'Unknown';
  }
}
