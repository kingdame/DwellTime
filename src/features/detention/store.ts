/**
 * Detention Store
 * Manages active detention tracking state
 * Will be implemented when Zustand is installed
 */

import type { DetentionEvent, Facility, GpsLog, Photo } from '@/shared/types';

export interface PendingPhoto {
  localUri: string;
  category: Photo['category'];
  lat: number | null;
  lng: number | null;
  timestamp: string;
  caption: string | null;
}

export interface PendingGpsLog {
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: string;
}

export interface ActiveDetention {
  id: string | null;
  facilityId: string | null;
  facilityName: string | null;
  eventType: 'pickup' | 'delivery';
  loadReference: string | null;
  arrivalTime: Date | null;
  gracePeriodEnd: Date | null;
  detentionStart: Date | null;
  isInGracePeriod: boolean;
  isTracking: boolean;
}

export interface CurrentLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

export interface DetentionState {
  // Active detention state
  activeDetention: ActiveDetention;

  // GPS state
  currentLocation: CurrentLocation | null;

  // Offline queue
  pendingUploads: {
    photos: PendingPhoto[];
    gpsLogs: PendingGpsLog[];
  };

  // Detected facility (from geofence)
  detectedFacility: Facility | null;

  // Timer display values (computed from activeDetention)
  elapsedSeconds: number;
  detentionSeconds: number;
  currentEarnings: number;

  // Actions
  startTracking: (facility: Facility, eventType: 'pickup' | 'delivery', loadReference?: string) => void;
  endTracking: () => Promise<DetentionEvent | null>;
  updateLocation: (location: CurrentLocation) => void;
  addPendingPhoto: (photo: PendingPhoto) => void;
  addPendingGpsLog: (log: PendingGpsLog) => void;
  syncPendingUploads: () => Promise<void>;
  setDetectedFacility: (facility: Facility | null) => void;
  updateTimerDisplay: () => void;
  resetActiveDetention: () => void;
}

// Initial state for active detention
export const initialActiveDetention: ActiveDetention = {
  id: null,
  facilityId: null,
  facilityName: null,
  eventType: 'delivery',
  loadReference: null,
  arrivalTime: null,
  gracePeriodEnd: null,
  detentionStart: null,
  isInGracePeriod: false,
  isTracking: false,
};

// TODO: Implement with Zustand
// This will be the most complex store, handling:
// 1. Timer persistence (survives app restart)
// 2. Background GPS logging queue
// 3. Offline photo queue
// 4. Sync with Supabase when online
