/**
 * useGeofencing Hook
 * Monitors driver location and detects facility arrivals/departures
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import type { Facility } from '@/shared/types';
import { detectCurrentFacility, isWithinGeofence, GEOFENCE_RADIUS_METERS } from '../services/facilityService';

export interface GeofenceState {
  isMonitoring: boolean;
  currentLocation: { lat: number; lng: number; accuracy: number } | null;
  detectedFacility: Facility | null;
  lastUpdate: Date | null;
  error: string | null;
}

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  facility: Facility;
  timestamp: Date;
  location: { lat: number; lng: number };
}

interface UseGeofencingOptions {
  enabled?: boolean;
  updateInterval?: number; // milliseconds
  onEnterFacility?: (event: GeofenceEvent) => void;
  onExitFacility?: (event: GeofenceEvent) => void;
}

const DEFAULT_UPDATE_INTERVAL = 30000; // 30 seconds

export function useGeofencing(options: UseGeofencingOptions = {}) {
  const {
    enabled = true,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    onEnterFacility,
    onExitFacility,
  } = options;

  const [state, setState] = useState<GeofenceState>({
    isMonitoring: false,
    currentLocation: null,
    detectedFacility: null,
    lastUpdate: null,
    error: null,
  });

  const previousFacilityRef = useRef<Facility | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Check location permissions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy ?? 0,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }, []);

  // Check for facility and handle enter/exit events
  const checkFacility = useCallback(async (lat: number, lng: number) => {
    try {
      const facility = await detectCurrentFacility(lat, lng);
      const previousFacility = previousFacilityRef.current;

      // Detect enter event
      if (facility && (!previousFacility || previousFacility.id !== facility.id)) {
        const event: GeofenceEvent = {
          type: 'enter',
          facility,
          timestamp: new Date(),
          location: { lat, lng },
        };
        onEnterFacility?.(event);
      }

      // Detect exit event
      if (previousFacility && (!facility || facility.id !== previousFacility.id)) {
        const event: GeofenceEvent = {
          type: 'exit',
          facility: previousFacility,
          timestamp: new Date(),
          location: { lat, lng },
        };
        onExitFacility?.(event);
      }

      previousFacilityRef.current = facility;

      setState((prev) => ({
        ...prev,
        detectedFacility: facility,
        lastUpdate: new Date(),
        error: null,
      }));
    } catch (error) {
      console.error('Error checking facility:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to detect facility',
      }));
    }
  }, [onEnterFacility, onExitFacility]);

  // Update location and check facility
  const updateLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();

      setState((prev) => ({
        ...prev,
        currentLocation: location,
        error: null,
      }));

      await checkFacility(location.lat, location.lng);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Location error',
      }));
    }
  }, [getCurrentLocation, checkFacility]);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      setState((prev) => ({
        ...prev,
        isMonitoring: false,
        error: 'Location permission not granted',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isMonitoring: true,
      error: null,
    }));

    // Initial location check
    await updateLocation();

    // Set up interval for periodic updates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(updateLocation, updateInterval);
  }, [checkPermissions, updateLocation, updateInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isMonitoring: false,
    }));
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - refresh location
        if (enabled && state.isMonitoring) {
          updateLocation();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, state.isMonitoring, updateLocation]);

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  // Force refresh
  const refresh = useCallback(async () => {
    await updateLocation();
  }, [updateLocation]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    refresh,
  };
}

// Export constants
export { GEOFENCE_RADIUS_METERS };
