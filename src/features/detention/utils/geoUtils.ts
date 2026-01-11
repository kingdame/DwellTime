/**
 * Geolocation Utilities
 * Pure functions for geographic calculations (no external dependencies)
 */

import { config } from '@/constants';
import type { Facility } from '@/shared/types';

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if coordinates are within radius of a facility
 */
export function isWithinGeofence(
  coords: GeoCoords,
  facility: Facility,
  radiusMeters: number = config.detention.geofenceRadiusMeters
): boolean {
  const distance = calculateDistance(
    coords.latitude,
    coords.longitude,
    facility.lat,
    facility.lng
  );
  return distance <= radiusMeters;
}

/**
 * Find nearest facility from list
 */
export function findNearestFacility(
  coords: GeoCoords,
  facilities: Facility[]
): { facility: Facility; distance: number } | null {
  if (facilities.length === 0) return null;

  let nearest: { facility: Facility; distance: number } | null = null;

  for (const facility of facilities) {
    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      facility.lat,
      facility.lng
    );

    if (!nearest || distance < nearest.distance) {
      nearest = { facility, distance };
    }
  }

  return nearest;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Calculate bearing between two points (in degrees)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

/**
 * Get cardinal direction from bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}
