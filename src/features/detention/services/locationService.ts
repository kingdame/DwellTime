/**
 * Location Service
 * Handles GPS tracking and geofence detection
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { config } from '@/constants';
import type { Facility } from '@/shared/types';

// Task name for background location tracking
export const LOCATION_TASK_NAME = 'dwelltime-background-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface LocationServiceConfig {
  accuracy?: Location.Accuracy;
  distanceInterval?: number;
  timeInterval?: number;
}

const DEFAULT_CONFIG: LocationServiceConfig = {
  accuracy: Location.Accuracy.High,
  distanceInterval: 50, // meters
  timeInterval: config.detention.gpsLogIntervalMinutes * 60 * 1000, // 5 min in ms
};

/**
 * Request location permissions
 * Returns true if all permissions granted
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();

  return backgroundStatus === 'granted';
}

/**
 * Check current permission status
 */
export async function checkLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();

  return {
    foreground: foreground.status === 'granted',
    background: background.status === 'granted',
  };
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    return null;
  }
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
 * Check if location is within facility geofence
 */
export function isWithinGeofence(
  location: LocationCoords,
  facility: Facility,
  radiusMeters: number = config.detention.geofenceRadiusMeters
): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    facility.lat,
    facility.lng
  );
  return distance <= radiusMeters;
}

/**
 * Find nearest facility from list
 */
export function findNearestFacility(
  location: LocationCoords,
  facilities: Facility[]
): { facility: Facility; distance: number } | null {
  if (facilities.length === 0) return null;

  let nearest: { facility: Facility; distance: number } | null = null;

  for (const facility of facilities) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
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
 * Start background location tracking
 */
export async function startBackgroundTracking(
  _onLocation?: (location: LocationCoords) => void
): Promise<boolean> {
  try {
    const hasPermission = await checkLocationPermissions();
    if (!hasPermission.background) {
      console.warn('Background location permission not granted');
      return false;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: DEFAULT_CONFIG.accuracy,
      distanceInterval: DEFAULT_CONFIG.distanceInterval,
      timeInterval: DEFAULT_CONFIG.timeInterval,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'DwellTime',
        notificationBody: 'Tracking detention time...',
        notificationColor: '#1A56DB',
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to start background tracking:', error);
    return false;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundTracking(): Promise<void> {
  try {
    const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch (error) {
    console.error('Failed to stop background tracking:', error);
  }
}

/**
 * Check if background tracking is active
 */
export async function isBackgroundTrackingActive(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  } catch {
    return false;
  }
}
