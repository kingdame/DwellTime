/**
 * Detention Store - Manages detention tracking state
 */

import { create } from 'zustand';

interface DetentionState {
  isTracking: boolean;
  startTime: number | null;
  facilityId: string | null;
  facilityName: string | null;
  
  // Actions
  startTracking: (facilityId: string, facilityName: string) => void;
  stopTracking: () => void;
  reset: () => void;
}

export const useDetentionStore = create<DetentionState>((set) => ({
  isTracking: false,
  startTime: null,
  facilityId: null,
  facilityName: null,

  startTracking: (facilityId, facilityName) =>
    set({
      isTracking: true,
      startTime: Date.now(),
      facilityId,
      facilityName,
    }),

  stopTracking: () =>
    set({
      isTracking: false,
      startTime: null,
      facilityId: null,
      facilityName: null,
    }),

  reset: () =>
    set({
      isTracking: false,
      startTime: null,
      facilityId: null,
      facilityName: null,
    }),
}));
