/**
 * Detention Store
 * Manages active detention tracking state with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DetentionEvent, Facility, Photo } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { config } from '@/constants';
import {
  scheduleGracePeriodWarning,
  scheduleDetentionStartedNotification,
  sendArrivedAtFacilityNotification,
  cancelAllDetentionNotifications,
} from '@/features/notifications';

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
  arrivalTime: string | null; // ISO string for persistence
  gracePeriodMinutes: number;
  hourlyRate: number;
  isTracking: boolean;
  notes: string | null;
  verificationCode: string | null;
}

export interface CurrentLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export interface DetentionState {
  // Active detention state
  activeDetention: ActiveDetention;

  // GPS state
  currentLocation: CurrentLocation | null;
  lastGpsLogTime: string | null;

  // Offline queue
  pendingGpsLogs: PendingGpsLog[];
  pendingPhotos: PendingPhoto[];

  // Detected facility (from geofence)
  detectedFacility: Facility | null;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: string | null;

  // Actions
  startTracking: (
    facility: Facility,
    eventType: 'pickup' | 'delivery',
    gracePeriodMinutes: number,
    hourlyRate: number,
    loadReference?: string
  ) => Promise<string | null>;
  endTracking: () => Promise<DetentionEvent | null>;
  updateLocation: (location: CurrentLocation) => void;
  logGpsPoint: () => void;
  addPendingPhoto: (photo: PendingPhoto) => void;
  syncPendingUploads: () => Promise<void>;
  setDetectedFacility: (facility: Facility | null) => void;
  updateNotes: (notes: string) => void;
  resetActiveDetention: () => void;
  getElapsedSeconds: () => number;
  getDetentionSeconds: () => number;
  getCurrentEarnings: () => number;
  isInGracePeriod: () => boolean;
}

// Generate 8-character alphanumeric verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initial state for active detention
const initialActiveDetention: ActiveDetention = {
  id: null,
  facilityId: null,
  facilityName: null,
  eventType: 'delivery',
  loadReference: null,
  arrivalTime: null,
  gracePeriodMinutes: config.detention.defaultGracePeriodMinutes,
  hourlyRate: config.detention.defaultHourlyRate,
  isTracking: false,
  notes: null,
  verificationCode: null,
};

export const useDetentionStore = create<DetentionState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeDetention: initialActiveDetention,
      currentLocation: null,
      lastGpsLogTime: null,
      pendingGpsLogs: [],
      pendingPhotos: [],
      detectedFacility: null,
      isSyncing: false,
      lastSyncTime: null,

      // Start tracking at a facility
      startTracking: async (facility, eventType, gracePeriodMinutes, hourlyRate, loadReference) => {
        const now = new Date().toISOString();
        const verificationCode = generateVerificationCode();

        // Create detention event in Supabase
        try {
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.user) {
            console.error('No authenticated user');
            return null;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('detention_events')
            .insert({
              user_id: session.session.user.id,
              facility_id: facility.id,
              event_type: eventType,
              load_reference: loadReference || null,
              arrival_time: now,
              grace_period_minutes: gracePeriodMinutes,
              hourly_rate: hourlyRate,
              status: 'active',
              verification_code: verificationCode,
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to create detention event:', error);
            return null;
          }

          set({
            activeDetention: {
              id: data?.id,
              facilityId: facility.id,
              facilityName: facility.name,
              eventType,
              loadReference: loadReference || null,
              arrivalTime: now,
              gracePeriodMinutes,
              hourlyRate,
              isTracking: true,
              notes: null,
              verificationCode,
            },
            lastGpsLogTime: now,
          });

          // Log initial GPS point
          get().logGpsPoint();

          // Schedule notifications
          const arrivalDate = new Date(now);
          const gracePeriodEndTime = new Date(
            arrivalDate.getTime() + gracePeriodMinutes * 60 * 1000
          );

          // Send arrival notification
          sendArrivedAtFacilityNotification(facility.name).catch(console.error);

          // Schedule grace period warning (15 minutes before end)
          scheduleGracePeriodWarning(
            facility.name,
            gracePeriodEndTime,
            15 // warn 15 minutes before
          ).catch(console.error);

          // Schedule detention started notification
          scheduleDetentionStartedNotification(
            facility.name,
            gracePeriodEndTime,
            hourlyRate
          ).catch(console.error);

          return data?.id ?? null;
        } catch (error) {
          console.error('Error starting tracking:', error);
          return null;
        }
      },

      // End tracking and finalize detention event
      endTracking: async () => {
        const { activeDetention } = get();
        if (!activeDetention.isTracking || !activeDetention.id) {
          return null;
        }

        const now = new Date().toISOString();

        // Calculate final values
        const elapsedSeconds = get().getElapsedSeconds();
        const detentionSeconds = get().getDetentionSeconds();
        const earnings = get().getCurrentEarnings();

        // Cancel all scheduled notifications
        cancelAllDetentionNotifications().catch(console.error);

        try {
          // Sync any pending GPS logs first
          await get().syncPendingUploads();

          // Update detention event in Supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('detention_events')
            .update({
              departure_time: now,
              total_elapsed_minutes: Math.floor(elapsedSeconds / 60),
              detention_minutes: Math.floor(detentionSeconds / 60),
              detention_amount: earnings,
              status: 'completed',
              notes: activeDetention.notes,
            })
            .eq('id', activeDetention.id)
            .select()
            .single();

          if (error) {
            console.error('Failed to end detention event:', error);
            return null;
          }

          // Reset state
          get().resetActiveDetention();

          return data as DetentionEvent;
        } catch (error) {
          console.error('Error ending tracking:', error);
          return null;
        }
      },

      // Update current location
      updateLocation: (location) => {
        set({ currentLocation: location });
      },

      // Log a GPS point (called every 5 minutes during tracking)
      logGpsPoint: () => {
        const { activeDetention, currentLocation } = get();
        if (!activeDetention.isTracking || !currentLocation) {
          return;
        }

        const now = new Date().toISOString();
        const gpsLog: PendingGpsLog = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy,
          timestamp: now,
        };

        set((state) => ({
          pendingGpsLogs: [...state.pendingGpsLogs, gpsLog],
          lastGpsLogTime: now,
        }));
      },

      // Add a pending photo
      addPendingPhoto: (photo) => {
        set((state) => ({
          pendingPhotos: [...state.pendingPhotos, photo],
        }));
      },

      // Sync pending uploads to Supabase
      syncPendingUploads: async () => {
        const { activeDetention, pendingGpsLogs, isSyncing } = get();
        if (isSyncing || pendingGpsLogs.length === 0) {
          return;
        }

        set({ isSyncing: true });

        try {
          // Sync GPS logs
          if (activeDetention.id && pendingGpsLogs.length > 0) {
            const logsToInsert = pendingGpsLogs.map((log) => ({
              event_id: activeDetention.id,
              lat: log.lat,
              lng: log.lng,
              accuracy: log.accuracy,
              recorded_at: log.timestamp,
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).from('gps_logs').insert(logsToInsert);

            if (!error) {
              set({ pendingGpsLogs: [] });
            } else {
              console.error('Failed to sync GPS logs:', error);
            }
          }

          set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
          console.error('Error syncing uploads:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Set detected facility from geofence
      setDetectedFacility: (facility) => {
        set({ detectedFacility: facility });
      },

      // Update notes for active detention
      updateNotes: (notes) => {
        set((state) => ({
          activeDetention: { ...state.activeDetention, notes },
        }));
      },

      // Reset active detention state
      resetActiveDetention: () => {
        set({
          activeDetention: initialActiveDetention,
          currentLocation: null,
          lastGpsLogTime: null,
          detectedFacility: null,
        });
      },

      // Calculate elapsed seconds since arrival
      getElapsedSeconds: () => {
        const { activeDetention } = get();
        if (!activeDetention.arrivalTime) return 0;

        const arrival = new Date(activeDetention.arrivalTime);
        const now = new Date();
        return Math.floor((now.getTime() - arrival.getTime()) / 1000);
      },

      // Calculate detention seconds (after grace period)
      getDetentionSeconds: () => {
        const { activeDetention } = get();
        if (!activeDetention.arrivalTime) return 0;

        const arrival = new Date(activeDetention.arrivalTime);
        const gracePeriodMs = activeDetention.gracePeriodMinutes * 60 * 1000;
        const gracePeriodEnd = new Date(arrival.getTime() + gracePeriodMs);
        const now = new Date();

        if (now <= gracePeriodEnd) return 0;

        return Math.floor((now.getTime() - gracePeriodEnd.getTime()) / 1000);
      },

      // Calculate current earnings
      getCurrentEarnings: () => {
        const { activeDetention } = get();
        const detentionSeconds = get().getDetentionSeconds();
        if (detentionSeconds === 0) return 0;

        const hours = detentionSeconds / 3600;
        return hours * activeDetention.hourlyRate;
      },

      // Check if still in grace period
      isInGracePeriod: () => {
        const { activeDetention } = get();
        if (!activeDetention.arrivalTime) return false;

        const arrival = new Date(activeDetention.arrivalTime);
        const gracePeriodMs = activeDetention.gracePeriodMinutes * 60 * 1000;
        const gracePeriodEnd = new Date(arrival.getTime() + gracePeriodMs);
        const now = new Date();

        return now < gracePeriodEnd;
      },
    }),
    {
      name: 'dwelltime-detention',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these values for app restart recovery
        activeDetention: state.activeDetention,
        pendingGpsLogs: state.pendingGpsLogs,
        pendingPhotos: state.pendingPhotos,
        lastGpsLogTime: state.lastGpsLogTime,
      }),
    }
  )
);
