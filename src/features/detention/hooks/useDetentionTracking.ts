/**
 * useDetentionTracking Hook
 * Full detention tracking with GPS logging, persistence, and timer
 * Combines the detention store with real-time timer updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { useDetentionStore } from '../store';
import {
  formatTime,
  formatCurrency,
} from '../utils/timerUtils';
import {
  getCurrentLocation,
  startBackgroundTracking,
  stopBackgroundTracking,
  type LocationCoords,
} from '../services/locationService';
import { config } from '@/constants';
import type { Facility, DetentionEvent } from '@/shared/types';

export interface DetentionTrackingState {
  // Timer state
  isActive: boolean;
  isInGracePeriod: boolean;
  elapsedSeconds: number;
  detentionSeconds: number;
  currentEarnings: number;

  // Formatted values
  elapsedFormatted: string;
  detentionFormatted: string;
  earningsFormatted: string;

  // Detention info
  facilityName: string | null;
  eventType: 'pickup' | 'delivery';
  verificationCode: string | null;

  // Location state
  currentLocation: LocationCoords | null;
  pendingGpsLogs: number;

  // Status
  isLoading: boolean;
  error: string | null;
}

export interface DetentionTrackingActions {
  startTracking: (
    facility: Facility,
    eventType: 'pickup' | 'delivery',
    gracePeriodMinutes?: number,
    hourlyRate?: number,
    loadReference?: string
  ) => Promise<boolean>;
  stopTracking: () => Promise<DetentionEvent | null>;
  updateNotes: (notes: string) => void;
  syncNow: () => Promise<void>;
}

const GPS_LOG_INTERVAL_MS = config.detention.gpsLogIntervalMinutes * 60 * 1000;

export function useDetentionTracking(): DetentionTrackingState & DetentionTrackingActions {
  const store = useDetentionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer display state (updates every second)
  const [timerState, setTimerState] = useState({
    elapsedSeconds: 0,
    detentionSeconds: 0,
    currentEarnings: 0,
    isInGracePeriod: false,
    elapsedFormatted: '00:00:00',
    detentionFormatted: '00:00:00',
    earningsFormatted: '$0.00',
  });

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update timer display every second when tracking
  useEffect(() => {
    if (store.activeDetention.isTracking) {
      const updateTimer = () => {
        const elapsed = store.getElapsedSeconds();
        const detention = store.getDetentionSeconds();
        const earnings = store.getCurrentEarnings();
        const inGrace = store.isInGracePeriod();

        setTimerState({
          elapsedSeconds: elapsed,
          detentionSeconds: detention,
          currentEarnings: earnings,
          isInGracePeriod: inGrace,
          elapsedFormatted: formatTime(elapsed),
          detentionFormatted: formatTime(detention),
          earningsFormatted: formatCurrency(earnings),
        });
      };

      // Update immediately
      updateTimer();

      // Then update every second
      timerIntervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    } else {
      // Reset timer state when not tracking
      setTimerState({
        elapsedSeconds: 0,
        detentionSeconds: 0,
        currentEarnings: 0,
        isInGracePeriod: false,
        elapsedFormatted: '00:00:00',
        detentionFormatted: '00:00:00',
        earningsFormatted: '$0.00',
      });
    }
  }, [store.activeDetention.isTracking]);

  // GPS logging interval when tracking
  useEffect(() => {
    if (store.activeDetention.isTracking) {
      const logGps = async () => {
        const location = await getCurrentLocation();
        if (location) {
          store.updateLocation({
            lat: location.latitude,
            lng: location.longitude,
            accuracy: location.accuracy ?? 0,
            timestamp: new Date(location.timestamp).toISOString(),
          });
          store.logGpsPoint();
        }
      };

      // Log GPS every 5 minutes
      gpsIntervalRef.current = setInterval(logGps, GPS_LOG_INTERVAL_MS);

      // Also try to sync pending logs periodically
      const syncInterval = setInterval(() => {
        store.syncPendingUploads();
      }, GPS_LOG_INTERVAL_MS);

      return () => {
        if (gpsIntervalRef.current) {
          clearInterval(gpsIntervalRef.current);
        }
        clearInterval(syncInterval);
      };
    }
  }, [store.activeDetention.isTracking]);

  // Start tracking at a facility
  const startTracking = useCallback(
    async (
      facility: Facility,
      eventType: 'pickup' | 'delivery',
      gracePeriodMinutes?: number,
      hourlyRate?: number,
      loadReference?: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      const gracePeriod = gracePeriodMinutes ?? config.detention.defaultGracePeriodMinutes;
      const rate = hourlyRate ?? config.detention.defaultHourlyRate;

      try {
        // Get initial location
        const location = await getCurrentLocation();
        if (location) {
          store.updateLocation({
            lat: location.latitude,
            lng: location.longitude,
            accuracy: location.accuracy ?? 0,
            timestamp: new Date(location.timestamp).toISOString(),
          });
        }

        // Start tracking in store (creates database record)
        const eventId = await store.startTracking(
          facility,
          eventType,
          gracePeriod,
          rate,
          loadReference
        );

        if (!eventId) {
          setError('Failed to start tracking');
          return false;
        }

        // Start background location tracking
        await startBackgroundTracking();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start tracking');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [store]
  );

  // Stop tracking and finalize detention
  const stopTracking = useCallback(async (): Promise<DetentionEvent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop background tracking
      await stopBackgroundTracking();

      // End tracking in store
      const event = await store.endTracking();

      if (!event) {
        setError('Failed to end tracking');
      }

      return event;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop tracking');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  // Update notes
  const updateNotes = useCallback(
    (notes: string) => {
      store.updateNotes(notes);
    },
    [store]
  );

  // Force sync
  const syncNow = useCallback(async () => {
    await store.syncPendingUploads();
  }, [store]);

  return {
    // Timer state
    isActive: store.activeDetention.isTracking,
    ...timerState,

    // Detention info
    facilityName: store.activeDetention.facilityName,
    eventType: store.activeDetention.eventType,
    verificationCode: store.activeDetention.verificationCode,

    // Location state
    currentLocation: store.currentLocation
      ? {
          latitude: store.currentLocation.lat,
          longitude: store.currentLocation.lng,
          accuracy: store.currentLocation.accuracy,
          timestamp: new Date(store.currentLocation.timestamp).getTime(),
        }
      : null,
    pendingGpsLogs: store.pendingGpsLogs.length,

    // Status
    isLoading,
    error,

    // Actions
    startTracking,
    stopTracking,
    updateNotes,
    syncNow,
  };
}
