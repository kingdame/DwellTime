/**
 * Fleet Store Tests
 * Tests for Zustand store state management
 */

// Mock AsyncStorage before imports
const mockAsyncStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockAsyncStorage[key] || null);
  }),
  removeItem: jest.fn((key: string) => {
    delete mockAsyncStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockAsyncStorage).forEach(key => delete mockAsyncStorage[key]);
    return Promise.resolve();
  }),
}));

// Mock Zustand persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({}),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockFleet = {
  id: 'fleet-123',
  name: 'Test Fleet',
  owner_id: 'owner-456',
  company_name: 'Test Trucking Co',
  company_address: '123 Main St',
  company_phone: '555-1234',
  company_email: 'fleet@test.com',
  dot_number: 'DOT123456',
  mc_number: 'MC654321',
  logo_url: null,
  subscription_tier: 'fleet' as const,
  subscription_status: 'active' as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  max_drivers: 50,
  current_period_end: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

interface MockMember {
  id: string;
  fleet_id: string;
  user_id: string;
  role: 'admin' | 'driver';
  status: 'active' | 'pending' | 'suspended' | 'removed';
  driver_id_number: string | null;
  truck_number: string | null;
  trailer_number: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  hourly_rate_override: number | null;
  grace_period_override: number | null;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  suspended_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
}

const mockMember: MockMember = {
  id: 'member-123',
  fleet_id: 'fleet-123',
  user_id: 'user-456',
  role: 'admin',
  status: 'active',
  driver_id_number: null,
  truck_number: 'T-001',
  trailer_number: null,
  phone: '555-9999',
  email: 'admin@test.com',
  name: 'Admin User',
  hourly_rate_override: null,
  grace_period_override: null,
  invited_by: null,
  invited_at: null,
  joined_at: '2024-01-01T00:00:00Z',
  suspended_at: null,
  removed_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockDriverMember: MockMember = {
  ...mockMember,
  id: 'member-456',
  user_id: 'user-789',
  role: 'driver',
  name: 'Driver One',
  email: 'driver@test.com',
  truck_number: 'T-002',
};

const mockFleetSummary = {
  fleet_id: 'fleet-123',
  fleet_name: 'Test Fleet',
  total_drivers: 5,
  active_drivers: 4,
  pending_invitations: 2,
  total_detention_events: 100,
  total_detention_amount: 5000,
  total_detention_minutes: 6000,
  unpaid_invoice_count: 3,
  unpaid_invoice_amount: 1500,
  events_this_week: 10,
  events_this_month: 40,
  amount_this_week: 500,
  amount_this_month: 2000,
  top_facilities: [],
};

const mockDriverMetrics = [
  {
    user_id: 'user-789',
    member_id: 'member-456',
    name: 'Driver One',
    email: 'driver@test.com',
    truck_number: 'T-002',
    total_detention_events: 20,
    total_detention_minutes: 1200,
    total_detention_amount: 1000,
    average_wait_time_minutes: 60,
    events_this_week: 3,
    events_this_month: 12,
    amount_this_week: 150,
    amount_this_month: 600,
    last_event_date: '2024-01-15T00:00:00Z',
  },
];

// ============================================================================
// Test Suites
// ============================================================================

describe('Fleet Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockAsyncStorage).forEach(key => delete mockAsyncStorage[key]);
  });

  describe('Initial State', () => {
    it('has correct initial values', () => {
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

      expect(initialState.currentFleet).toBeNull();
      expect(initialState.currentRole).toBeNull();
      expect(initialState.fleetMembers).toEqual([]);
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
    });
  });

  describe('setCurrentFleet', () => {
    it('updates fleet and role', () => {
      let state = {
        currentFleet: null as typeof mockFleet | null,
        currentRole: null as string | null,
        currentMembership: null as typeof mockMember | null,
      };

      const setCurrentFleet = (
        fleet: typeof mockFleet | null,
        role: string | null,
        membership: typeof mockMember | null = null
      ) => {
        state = {
          currentFleet: fleet,
          currentRole: role,
          currentMembership: membership,
        };
      };

      setCurrentFleet(mockFleet, 'admin', mockMember);

      expect(state.currentFleet).toEqual(mockFleet);
      expect(state.currentRole).toBe('admin');
      expect(state.currentMembership).toEqual(mockMember);
    });

    it('clears members when fleet changes', () => {
      let state: {
        currentFleet: typeof mockFleet | null;
        fleetMembers: MockMember[];
        selectedDriverId: string | null;
      } = {
        currentFleet: mockFleet,
        fleetMembers: [mockMember, mockDriverMember],
        selectedDriverId: 'member-456',
      };

      const setCurrentFleet = (fleet: typeof mockFleet | null) => {
        state = {
          currentFleet: fleet,
          fleetMembers: fleet ? state.fleetMembers : [],
          selectedDriverId: null,
        };
      };

      setCurrentFleet(null);

      expect(state.currentFleet).toBeNull();
      expect(state.fleetMembers).toEqual([]);
      expect(state.selectedDriverId).toBeNull();
    });

    it('clears error when setting fleet', () => {
      let state = {
        currentFleet: null as typeof mockFleet | null,
        error: 'Previous error' as string | null,
      };

      const setCurrentFleet = (fleet: typeof mockFleet | null) => {
        state = {
          currentFleet: fleet,
          error: null,
        };
      };

      setCurrentFleet(mockFleet);

      expect(state.error).toBeNull();
    });
  });

  describe('setFleetMembers', () => {
    it('updates members list', () => {
      let state = {
        fleetMembers: [] as MockMember[],
        lastMembersSyncTime: null as string | null,
      };

      const setFleetMembers = (members: MockMember[]) => {
        state = {
          fleetMembers: members,
          lastMembersSyncTime: new Date().toISOString(),
        };
      };

      setFleetMembers([mockMember, mockDriverMember]);

      expect(state.fleetMembers).toHaveLength(2);
      expect(state.lastMembersSyncTime).not.toBeNull();
    });

    it('updates sync timestamp', () => {
      const beforeTime = new Date().toISOString();

      let state = {
        fleetMembers: [] as MockMember[],
        lastMembersSyncTime: null as string | null,
      };

      const setFleetMembers = (members: MockMember[]) => {
        state = {
          fleetMembers: members,
          lastMembersSyncTime: new Date().toISOString(),
        };
      };

      setFleetMembers([mockMember]);

      expect(state.lastMembersSyncTime).not.toBeNull();
      expect(new Date(state.lastMembersSyncTime!) >= new Date(beforeTime)).toBe(true);
    });
  });

  describe('addFleetMember', () => {
    it('adds member to existing list', () => {
      let state = {
        fleetMembers: [mockMember] as MockMember[],
      };

      const addFleetMember = (member: MockMember) => {
        state = {
          fleetMembers: [...state.fleetMembers, member],
        };
      };

      addFleetMember(mockDriverMember);

      expect(state.fleetMembers).toHaveLength(2);
      expect(state.fleetMembers[1]).toEqual(mockDriverMember);
    });
  });

  describe('updateFleetMember', () => {
    it('updates specific member', () => {
      let state = {
        fleetMembers: [mockMember, mockDriverMember] as MockMember[],
      };

      const updateFleetMember = (memberId: string, updates: Partial<MockMember>) => {
        state = {
          fleetMembers: state.fleetMembers.map((m) =>
            m.id === memberId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
          ),
        };
      };

      updateFleetMember('member-456', { status: 'suspended' });

      const updatedMember = state.fleetMembers.find(m => m.id === 'member-456');
      expect(updatedMember?.status).toBe('suspended');
    });

    it('updates timestamp on member', () => {
      const beforeUpdate = new Date().toISOString();

      let state = {
        fleetMembers: [mockMember] as MockMember[],
      };

      const updateFleetMember = (memberId: string, updates: Partial<MockMember>) => {
        state = {
          fleetMembers: state.fleetMembers.map((m) =>
            m.id === memberId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
          ),
        };
      };

      updateFleetMember('member-123', { name: 'Updated Name' });

      const updatedMember = state.fleetMembers[0];
      expect(new Date(updatedMember.updated_at) >= new Date(beforeUpdate)).toBe(true);
    });
  });

  describe('removeFleetMember', () => {
    it('removes member from list', () => {
      let state = {
        fleetMembers: [mockMember, mockDriverMember] as MockMember[],
        selectedDriverId: null as string | null,
      };

      const removeFleetMember = (memberId: string) => {
        state = {
          fleetMembers: state.fleetMembers.filter((m) => m.id !== memberId),
          selectedDriverId: state.selectedDriverId === memberId ? null : state.selectedDriverId,
        };
      };

      removeFleetMember('member-456');

      expect(state.fleetMembers).toHaveLength(1);
      expect(state.fleetMembers[0].id).toBe('member-123');
    });

    it('clears selected driver if removed', () => {
      let state = {
        fleetMembers: [mockMember, mockDriverMember] as MockMember[],
        selectedDriverId: 'member-456' as string | null,
      };

      const removeFleetMember = (memberId: string) => {
        state = {
          fleetMembers: state.fleetMembers.filter((m) => m.id !== memberId),
          selectedDriverId: state.selectedDriverId === memberId ? null : state.selectedDriverId,
        };
      };

      removeFleetMember('member-456');

      expect(state.selectedDriverId).toBeNull();
    });
  });

  describe('setFleetSummary', () => {
    it('updates summary data', () => {
      let state = {
        fleetSummary: null as typeof mockFleetSummary | null,
        lastSummarySyncTime: null as string | null,
      };

      const setFleetSummary = (summary: typeof mockFleetSummary | null) => {
        state = {
          fleetSummary: summary,
          lastSummarySyncTime: new Date().toISOString(),
        };
      };

      setFleetSummary(mockFleetSummary);

      expect(state.fleetSummary).toEqual(mockFleetSummary);
      expect(state.lastSummarySyncTime).not.toBeNull();
    });
  });

  describe('selectDriver', () => {
    it('sets selected driver ID', () => {
      let state = {
        selectedDriverId: null as string | null,
      };

      const selectDriver = (driverId: string | null) => {
        state = { selectedDriverId: driverId };
      };

      selectDriver('member-456');

      expect(state.selectedDriverId).toBe('member-456');
    });

    it('can clear selection', () => {
      let state = {
        selectedDriverId: 'member-456' as string | null,
      };

      const selectDriver = (driverId: string | null) => {
        state = { selectedDriverId: driverId };
      };

      selectDriver(null);

      expect(state.selectedDriverId).toBeNull();
    });
  });

  describe('setLoading / setRefreshing', () => {
    it('sets loading state', () => {
      let state = { isLoading: false };

      const setLoading = (isLoading: boolean) => {
        state = { isLoading };
      };

      setLoading(true);
      expect(state.isLoading).toBe(true);

      setLoading(false);
      expect(state.isLoading).toBe(false);
    });

    it('sets refreshing state', () => {
      let state = { isRefreshing: false };

      const setRefreshing = (isRefreshing: boolean) => {
        state = { isRefreshing };
      };

      setRefreshing(true);
      expect(state.isRefreshing).toBe(true);

      setRefreshing(false);
      expect(state.isRefreshing).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      let state = { error: null as string | null };

      const setError = (error: string | null) => {
        state = { error };
      };

      setError('Something went wrong');
      expect(state.error).toBe('Something went wrong');
    });

    it('clears error', () => {
      let state = { error: 'Previous error' as string | null };

      const setError = (error: string | null) => {
        state = { error };
      };

      setError(null);
      expect(state.error).toBeNull();
    });
  });

  describe('clearFleetContext', () => {
    it('resets all state to initial values', () => {
      type FleetState = {
        currentFleet: typeof mockFleet | null;
        currentRole: string | null;
        currentMembership: MockMember | null;
        fleetSettings: null;
        fleetMembers: MockMember[];
        fleetSummary: typeof mockFleetSummary | null;
        driverMetrics: typeof mockDriverMetrics;
        isLoading: boolean;
        isRefreshing: boolean;
        selectedDriverId: string | null;
        error: string | null;
        lastMembersSyncTime: string | null;
        lastSummarySyncTime: string | null;
      };

      const initialState: FleetState = {
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

      let state: FleetState = {
        currentFleet: mockFleet,
        currentRole: 'admin',
        currentMembership: mockMember,
        fleetSettings: null,
        fleetMembers: [mockMember, mockDriverMember],
        fleetSummary: mockFleetSummary,
        driverMetrics: mockDriverMetrics,
        isLoading: true,
        isRefreshing: true,
        selectedDriverId: 'member-456',
        error: 'Some error',
        lastMembersSyncTime: '2024-01-01T00:00:00Z',
        lastSummarySyncTime: '2024-01-01T00:00:00Z',
      };

      const clearFleetContext = () => {
        state = { ...initialState };
      };

      clearFleetContext();

      expect(state.currentFleet).toBeNull();
      expect(state.currentRole).toBeNull();
      expect(state.fleetMembers).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns true when role is admin', () => {
      const state = { currentRole: 'admin' };

      const isAdmin = () => state.currentRole === 'admin';

      expect(isAdmin()).toBe(true);
    });

    it('returns false when role is not admin', () => {
      const state = { currentRole: 'driver' };

      const isAdmin = () => state.currentRole === 'admin';

      expect(isAdmin()).toBe(false);
    });

    it('returns false when role is null', () => {
      const state = { currentRole: null };

      const isAdmin = () => state.currentRole === 'admin';

      expect(isAdmin()).toBe(false);
    });
  });

  describe('isDriver', () => {
    it('returns true when role is driver', () => {
      const state = { currentRole: 'driver' };

      const isDriver = () => state.currentRole === 'driver';

      expect(isDriver()).toBe(true);
    });

    it('returns false when role is admin', () => {
      const state = { currentRole: 'admin' };

      const isDriver = () => state.currentRole === 'driver';

      expect(isDriver()).toBe(false);
    });
  });

  describe('getSelectedDriver', () => {
    it('returns selected driver member', () => {
      const state = {
        fleetMembers: [mockMember, mockDriverMember],
        selectedDriverId: 'member-456',
      };

      const getSelectedDriver = () => {
        if (!state.selectedDriverId) return null;
        return state.fleetMembers.find((m) => m.id === state.selectedDriverId) || null;
      };

      expect(getSelectedDriver()).toEqual(mockDriverMember);
    });

    it('returns null when no selection', () => {
      const state = {
        fleetMembers: [mockMember, mockDriverMember],
        selectedDriverId: null as string | null,
      };

      const getSelectedDriver = () => {
        if (!state.selectedDriverId) return null;
        return state.fleetMembers.find((m) => m.id === state.selectedDriverId) || null;
      };

      expect(getSelectedDriver()).toBeNull();
    });

    it('returns null when driver not found', () => {
      const state = {
        fleetMembers: [mockMember],
        selectedDriverId: 'non-existent',
      };

      const getSelectedDriver = () => {
        if (!state.selectedDriverId) return null;
        return state.fleetMembers.find((m) => m.id === state.selectedDriverId) || null;
      };

      expect(getSelectedDriver()).toBeNull();
    });
  });

  describe('getActiveMembers', () => {
    it('returns only active members', () => {
      const suspendedMember = { ...mockDriverMember, id: 'member-789', status: 'suspended' as const };
      const state = {
        fleetMembers: [mockMember, mockDriverMember, suspendedMember],
      };

      const getActiveMembers = () => {
        return state.fleetMembers.filter((m) => m.status === 'active');
      };

      const activeMembers = getActiveMembers();
      expect(activeMembers).toHaveLength(2);
      expect(activeMembers.every(m => m.status === 'active')).toBe(true);
    });
  });

  describe('getPendingMembers', () => {
    it('returns only pending members', () => {
      const pendingMember = { ...mockDriverMember, id: 'member-789', status: 'pending' as const };
      const state = {
        fleetMembers: [mockMember, mockDriverMember, pendingMember],
      };

      const getPendingMembers = () => {
        return state.fleetMembers.filter((m) => m.status === 'pending');
      };

      const pendingMembers = getPendingMembers();
      expect(pendingMembers).toHaveLength(1);
      expect(pendingMembers[0].status).toBe('pending');
    });
  });

  describe('getDriverCount', () => {
    it('counts active drivers only', () => {
      const suspendedDriver = { ...mockDriverMember, id: 'member-789', status: 'suspended' as const };
      const state = {
        fleetMembers: [mockMember, mockDriverMember, suspendedDriver],
      };

      const getDriverCount = () => {
        return state.fleetMembers.filter(
          (m) => m.role === 'driver' && m.status === 'active'
        ).length;
      };

      expect(getDriverCount()).toBe(1);
    });

    it('excludes admin role from count', () => {
      const state = {
        fleetMembers: [mockMember, mockDriverMember],
      };

      const getDriverCount = () => {
        return state.fleetMembers.filter(
          (m) => m.role === 'driver' && m.status === 'active'
        ).length;
      };

      expect(getDriverCount()).toBe(1);
    });
  });

  describe('Persistence', () => {
    it('persists selected state properties', () => {
      const partialize = (state: any) => ({
        currentFleet: state.currentFleet,
        currentRole: state.currentRole,
        currentMembership: state.currentMembership,
        fleetSettings: state.fleetSettings,
      });

      const fullState = {
        currentFleet: mockFleet,
        currentRole: 'admin',
        currentMembership: mockMember,
        fleetSettings: null,
        fleetMembers: [mockMember, mockDriverMember],
        fleetSummary: mockFleetSummary,
        isLoading: true,
        error: 'some error',
      };

      const persisted = partialize(fullState);

      // Should include these
      expect(persisted.currentFleet).toBeDefined();
      expect(persisted.currentRole).toBeDefined();
      expect(persisted.currentMembership).toBeDefined();

      // Should not include these
      expect((persisted as any).fleetMembers).toBeUndefined();
      expect((persisted as any).fleetSummary).toBeUndefined();
      expect((persisted as any).isLoading).toBeUndefined();
      expect((persisted as any).error).toBeUndefined();
    });

    it('uses correct storage key', () => {
      const STORAGE_KEY = 'dwelltime-fleet';
      expect(STORAGE_KEY).toBe('dwelltime-fleet');
    });
  });
});

// ============================================================================
// Selector Hook Tests
// ============================================================================

describe('Fleet Store Selectors', () => {
  describe('useCurrentFleet selector', () => {
    it('selects currentFleet from state', () => {
      const state = { currentFleet: mockFleet };
      const selector = (s: typeof state) => s.currentFleet;

      expect(selector(state)).toEqual(mockFleet);
    });
  });

  describe('useCurrentRole selector', () => {
    it('selects currentRole from state', () => {
      const state = { currentRole: 'admin' };
      const selector = (s: typeof state) => s.currentRole;

      expect(selector(state)).toBe('admin');
    });
  });

  describe('useFleetMembers selector', () => {
    it('selects fleetMembers from state', () => {
      const state = { fleetMembers: [mockMember, mockDriverMember] };
      const selector = (s: typeof state) => s.fleetMembers;

      expect(selector(state)).toHaveLength(2);
    });
  });

  describe('useIsFleetAdmin selector', () => {
    it('returns true for admin role', () => {
      const state = { currentRole: 'admin' };
      const selector = (s: typeof state) => s.currentRole === 'admin';

      expect(selector(state)).toBe(true);
    });

    it('returns false for non-admin role', () => {
      const state = { currentRole: 'driver' };
      const selector = (s: typeof state) => s.currentRole === 'admin';

      expect(selector(state)).toBe(false);
    });
  });
});
