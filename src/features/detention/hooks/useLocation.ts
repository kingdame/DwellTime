/**
 * useLocation Hook
 * Manages location state and permissions
 */

import { useState, useEffect, useCallback } from 'react';

import {
  LocationCoords,
  requestLocationPermissions,
  checkLocationPermissions,
  getCurrentLocation,
  startBackgroundTracking,
  stopBackgroundTracking,
  isBackgroundTrackingActive,
} from '../services/locationService';

export interface UseLocationState {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  hasBackgroundPermission: boolean;
  isTracking: boolean;
}

export interface UseLocationActions {
  requestPermissions: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
}

export function useLocation(): UseLocationState & UseLocationActions {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    async function init() {
      try {
        const permissions = await checkLocationPermissions();
        setHasPermission(permissions.foreground);
        setHasBackgroundPermission(permissions.background);

        const tracking = await isBackgroundTrackingActive();
        setIsTracking(tracking);

        if (permissions.foreground) {
          const currentLocation = await getCurrentLocation();
          setLocation(currentLocation);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize location');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const granted = await requestLocationPermissions();
      const permissions = await checkLocationPermissions();

      setHasPermission(permissions.foreground);
      setHasBackgroundPermission(permissions.background);

      if (permissions.foreground) {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
      }

      return granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!hasPermission) {
      setError('Location permission not granted');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!hasBackgroundPermission) {
      setError('Background location permission not granted');
      return false;
    }

    try {
      const started = await startBackgroundTracking();
      setIsTracking(started);
      return started;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
      return false;
    }
  }, [hasBackgroundPermission]);

  const stopTracking = useCallback(async (): Promise<void> => {
    try {
      await stopBackgroundTracking();
      setIsTracking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop tracking');
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    hasBackgroundPermission,
    isTracking,
    requestPermissions,
    refreshLocation,
    startTracking,
    stopTracking,
  };
}
