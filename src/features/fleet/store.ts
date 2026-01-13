/**
 * Fleet Store
 * Manages fleet context and member state with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Fleet,
  FleetMember,
  FleetRole,
  FleetSettings,
  FleetSummary,
  DriverMetrics,
} from './types';

// ============================================================================
// State Interface
// ============================================================================

export interface FleetState {
  // Current fleet context
  currentFleet: Fleet | null;
  currentRole: FleetRole | null;
  currentMembership: FleetMember | null;
  fleetSettings: FleetSettings | null;

  // Fleet members list
  fleetMembers: FleetMember[];

  // Fleet summary/dashboard data
  fleetSummary: FleetSummary | null;
  driverMetrics: DriverMetrics[];

  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  selectedDriverId: string | null;
  error: string | null;

  // Last sync timestamps
  lastMembersSyncTime: string | null;
  lastSummarySyncTime: string | null;

  // Actions
  setCurrentFleet: (fleet: Fleet | null, role: FleetRole | null, membership?: FleetMember | null) => void;
  setFleetSettings: (settings: FleetSettings | null) => void;
  setFleetMembers: (members: FleetMember[]) => void;
  addFleetMember: (member: FleetMember) => void;
  updateFleetMember: (memberId: string, updates: Partial<FleetMember>) => void;
  removeFleetMember: (memberId: string) => void;
  setFleetSummary: (summary: FleetSummary | null) => void;
  setDriverMetrics: (metrics: DriverMetrics[]) => void;
  selectDriver: (driverId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  clearFleetContext: () => void;

  // Computed getters
  isAdmin: () => boolean;
  isDriver: () => boolean;
  getSelectedDriver: () => FleetMember | null;
  getSelectedDriverMetrics: () => DriverMetrics | null;
  getActiveMembers: () => FleetMember[];
  getPendingMembers: () => FleetMember[];
  getDriverCount: () => number;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  currentFleet: null,
  currentRole: null,
  currentMembership: null,
  fleetSettings: null,
  fleetMembers: [],
  fleetSummary: null,
  driverMetrics: [],
  isLoading: false,
  isRefreshing: false,
  selectedDriverId: null,
  error: null,
  lastMembersSyncTime: null,
  lastSummarySyncTime: null,
};

// ============================================================================
// Store
// ============================================================================

export const useFleetStore = create<FleetState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set current fleet context
      setCurrentFleet: (fleet, role, membership = null) => {
        set({
          currentFleet: fleet,
          currentRole: role,
          currentMembership: membership,
          // Clear members when fleet changes
          fleetMembers: fleet ? get().fleetMembers : [],
          fleetSummary: fleet ? get().fleetSummary : null,
          driverMetrics: fleet ? get().driverMetrics : [],
          selectedDriverId: null,
          error: null,
        });
      },

      // Set fleet settings
      setFleetSettings: (settings) => {
        set({ fleetSettings: settings });
      },

      // Set fleet members list
      setFleetMembers: (members) => {
        set({
          fleetMembers: members,
          lastMembersSyncTime: new Date().toISOString(),
        });
      },

      // Add a new fleet member
      addFleetMember: (member) => {
        set((state) => ({
          fleetMembers: [...state.fleetMembers, member],
        }));
      },

      // Update a fleet member
      updateFleetMember: (memberId, updates) => {
        set((state) => ({
          fleetMembers: state.fleetMembers.map((m) =>
            m.id === memberId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
          ),
        }));
      },

      // Remove a fleet member from list
      removeFleetMember: (memberId) => {
        set((state) => ({
          fleetMembers: state.fleetMembers.filter((m) => m.id !== memberId),
          selectedDriverId: state.selectedDriverId === memberId ? null : state.selectedDriverId,
        }));
      },

      // Set fleet summary data
      setFleetSummary: (summary) => {
        set({
          fleetSummary: summary,
          lastSummarySyncTime: new Date().toISOString(),
        });
      },

      // Set driver metrics
      setDriverMetrics: (metrics) => {
        set({ driverMetrics: metrics });
      },

      // Select a driver for detail view
      selectDriver: (driverId) => {
        set({ selectedDriverId: driverId });
      },

      // Set loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Set refreshing state (for pull-to-refresh)
      setRefreshing: (isRefreshing) => {
        set({ isRefreshing });
      },

      // Set error state
      setError: (error) => {
        set({ error });
      },

      // Clear all fleet context (on logout or leave fleet)
      clearFleetContext: () => {
        set(initialState);
      },

      // Check if current user is admin
      isAdmin: () => {
        return get().currentRole === 'admin';
      },

      // Check if current user is driver
      isDriver: () => {
        return get().currentRole === 'driver';
      },

      // Get selected driver member
      getSelectedDriver: () => {
        const { fleetMembers, selectedDriverId } = get();
        if (!selectedDriverId) return null;
        return fleetMembers.find((m) => m.id === selectedDriverId) || null;
      },

      // Get selected driver metrics
      getSelectedDriverMetrics: () => {
        const { driverMetrics, selectedDriverId } = get();
        if (!selectedDriverId) return null;
        return driverMetrics.find((m) => m.member_id === selectedDriverId) || null;
      },

      // Get active members
      getActiveMembers: () => {
        return get().fleetMembers.filter((m) => m.status === 'active');
      },

      // Get pending members
      getPendingMembers: () => {
        return get().fleetMembers.filter((m) => m.status === 'pending');
      },

      // Get driver count (active drivers only)
      getDriverCount: () => {
        return get().fleetMembers.filter(
          (m) => m.role === 'driver' && m.status === 'active'
        ).length;
      },
    }),
    {
      name: 'dwelltime-fleet',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these values for app restart recovery
        currentFleet: state.currentFleet,
        currentRole: state.currentRole,
        currentMembership: state.currentMembership,
        fleetSettings: state.fleetSettings,
        // Don't persist members list - fetch fresh on app start
        // Don't persist UI state
      }),
    }
  )
);

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

export const useCurrentFleet = () => useFleetStore((state) => state.currentFleet);
export const useCurrentRole = () => useFleetStore((state) => state.currentRole);
export const useFleetMembers = () => useFleetStore((state) => state.fleetMembers);
export const useFleetSummary = () => useFleetStore((state) => state.fleetSummary);
export const useFleetLoading = () => useFleetStore((state) => state.isLoading);
export const useFleetError = () => useFleetStore((state) => state.error);
export const useSelectedDriverId = () => useFleetStore((state) => state.selectedDriverId);
export const useIsFleetAdmin = () => useFleetStore((state) => state.currentRole === 'admin');
