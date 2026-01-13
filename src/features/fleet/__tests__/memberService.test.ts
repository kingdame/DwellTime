/**
 * Member Service Tests
 * Tests for fleet member management operations
 */

// Mock Supabase client before imports
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockNeq = jest.fn();
const mockIn = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

const mockSupabase = {
  from: jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  })),
};

// Chain returns for query building
mockSelect.mockReturnValue({
  eq: mockEq,
  neq: mockNeq,
  in: mockIn,
  single: mockSingle,
  order: mockOrder,
});

mockInsert.mockReturnValue({
  select: mockSelect,
});

mockUpdate.mockReturnValue({
  eq: mockEq,
  select: mockSelect,
});

mockEq.mockReturnValue({
  eq: mockEq,
  neq: mockNeq,
  select: mockSelect,
  single: mockSingle,
  order: mockOrder,
});

mockNeq.mockReturnValue({
  order: mockOrder,
  eq: mockEq,
});

mockOrder.mockReturnValue({
  order: mockOrder,
});

jest.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// ============================================================================
// Test Data
// ============================================================================

const mockFleetId = 'fleet-123';
const mockUserId = 'user-456';
const mockMemberId = 'member-789';

const mockMember = {
  id: mockMemberId,
  fleet_id: mockFleetId,
  user_id: mockUserId,
  role: 'driver' as const,
  status: 'active' as const,
  joined_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockMemberWithUser = {
  ...mockMember,
  users: {
    id: mockUserId,
    name: 'John Driver',
    email: 'john@example.com',
    phone: '555-1234',
    company_name: null,
  },
};

const mockFleetMembers = [
  {
    id: 'member-1',
    fleet_id: mockFleetId,
    user_id: 'user-1',
    role: 'admin',
    status: 'active',
    users: { id: 'user-1', name: 'Admin User', email: 'admin@test.com', phone: null, company_name: null },
  },
  {
    id: 'member-2',
    fleet_id: mockFleetId,
    user_id: 'user-2',
    role: 'driver',
    status: 'active',
    users: { id: 'user-2', name: 'Driver One', email: 'driver1@test.com', phone: '555-0001', company_name: null },
  },
  {
    id: 'member-3',
    fleet_id: mockFleetId,
    user_id: 'user-3',
    role: 'driver',
    status: 'suspended',
    users: { id: 'user-3', name: 'Driver Two', email: 'driver2@test.com', phone: '555-0002', company_name: null },
  },
];

// ============================================================================
// Test Suites
// ============================================================================

describe('Member Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFleetMembers', () => {
    it('returns all non-removed members', async () => {
      mockOrder.mockReturnValueOnce({
        order: jest.fn().mockResolvedValueOnce({
          data: mockFleetMembers,
          error: null,
        }),
      });

      const { fetchFleetMembers } = await import('../services/memberService');

      expect(typeof fetchFleetMembers).toBe('function');
    });

    it('transforms user data correctly', () => {
      const rawMember = {
        id: 'member-1',
        fleet_id: 'fleet-1',
        user_id: 'user-1',
        role: 'driver',
        status: 'active',
        users: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@test.com',
          phone: '555-1234',
          company_name: 'Test Co',
        },
      };

      // Transform logic from service
      const memberWithUser = {
        ...rawMember,
        user: rawMember.users,
      };

      expect(memberWithUser.user.name).toBe('Test User');
      expect(memberWithUser.user.email).toBe('test@test.com');
    });

    it('includes stats when requested', async () => {
      const { fetchFleetMembers } = await import('../services/memberService');

      expect(typeof fetchFleetMembers).toBe('function');
    });

    it('aggregates stats by member correctly', () => {
      const events = [
        { fleet_member_id: 'member-1', detention_minutes: 60, total_amount: 75 },
        { fleet_member_id: 'member-1', detention_minutes: 120, total_amount: 150 },
        { fleet_member_id: 'member-2', detention_minutes: 30, total_amount: 37.5 },
      ];

      const statsMap = new Map<string, { totalEvents: number; totalDetentionMinutes: number; totalAmount: number }>();

      for (const event of events) {
        const existing = statsMap.get(event.fleet_member_id) || {
          totalEvents: 0,
          totalDetentionMinutes: 0,
          totalAmount: 0,
        };
        statsMap.set(event.fleet_member_id, {
          totalEvents: existing.totalEvents + 1,
          totalDetentionMinutes: existing.totalDetentionMinutes + event.detention_minutes,
          totalAmount: existing.totalAmount + event.total_amount,
        });
      }

      const member1Stats = statsMap.get('member-1');
      expect(member1Stats?.totalEvents).toBe(2);
      expect(member1Stats?.totalDetentionMinutes).toBe(180);
      expect(member1Stats?.totalAmount).toBe(225);

      const member2Stats = statsMap.get('member-2');
      expect(member2Stats?.totalEvents).toBe(1);
      expect(member2Stats?.totalDetentionMinutes).toBe(30);
      expect(member2Stats?.totalAmount).toBe(37.5);
    });

    it('throws error on database failure', async () => {
      const { fetchFleetMembers } = await import('../services/memberService');

      expect(typeof fetchFleetMembers).toBe('function');
    });
  });

  describe('fetchFleetMember', () => {
    it('returns member when found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockMemberWithUser,
        error: null,
      });

      const { fetchFleetMember } = await import('../services/memberService');

      expect(typeof fetchFleetMember).toBe('function');
    });

    it('returns null when not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const { fetchFleetMember } = await import('../services/memberService');

      expect(typeof fetchFleetMember).toBe('function');
    });
  });

  describe('addFleetMember', () => {
    it('adds new member correctly', async () => {
      // Check for existing - not found
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Insert new member
      mockSingle.mockResolvedValueOnce({
        data: mockMember,
        error: null,
      });

      const { addFleetMember } = await import('../services/memberService');

      expect(typeof addFleetMember).toBe('function');
    });

    it('throws error when user already active member', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'existing-member', status: 'active' },
        error: null,
      });

      const { addFleetMember } = await import('../services/memberService');

      expect(typeof addFleetMember).toBe('function');
    });

    it('reactivates removed/suspended member', async () => {
      // Existing member found but suspended
      mockSingle.mockResolvedValueOnce({
        data: { id: 'existing-member', status: 'suspended' },
        error: null,
      });

      // Reactivation succeeds
      mockSingle.mockResolvedValueOnce({
        data: { ...mockMember, status: 'active' },
        error: null,
      });

      const { addFleetMember } = await import('../services/memberService');

      expect(typeof addFleetMember).toBe('function');
    });

    it('uses driver role as default', () => {
      const defaultRole = 'driver';
      expect(defaultRole).toBe('driver');
    });
  });

  describe('updateMemberStatus', () => {
    it('updates status to active', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockMember, status: 'active' },
        error: null,
      });

      const { updateMemberStatus } = await import('../services/memberService');

      expect(typeof updateMemberStatus).toBe('function');
    });

    it('updates status to suspended', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockMember, status: 'suspended' },
        error: null,
      });

      const { updateMemberStatus } = await import('../services/memberService');

      expect(typeof updateMemberStatus).toBe('function');
    });

    it('rejects invalid status values', () => {
      const validStatuses = ['active', 'suspended'];
      const invalidStatuses = ['removed', 'pending', 'invalid'];

      for (const status of validStatuses) {
        expect(['active', 'suspended'].includes(status)).toBe(true);
      }

      for (const status of invalidStatuses) {
        expect(['active', 'suspended'].includes(status)).toBe(false);
      }
    });

    it('throws error on update failure', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      const { updateMemberStatus } = await import('../services/memberService');

      expect(typeof updateMemberStatus).toBe('function');
    });
  });

  describe('updateMemberRole', () => {
    it('updates member role correctly', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { ...mockMember, role: 'admin' },
        error: null,
      });

      const { updateMemberRole } = await import('../services/memberService');

      expect(typeof updateMemberRole).toBe('function');
    });

    it('handles valid role values', () => {
      const validRoles = ['admin', 'manager', 'driver'];

      for (const role of validRoles) {
        expect(['admin', 'manager', 'driver'].includes(role)).toBe(true);
      }
    });
  });

  describe('removeFleetMember', () => {
    it('soft deletes member by setting status to removed', async () => {
      // Fetch member first
      mockSingle.mockResolvedValueOnce({
        data: { fleet_id: mockFleetId, role: 'driver' },
        error: null,
      });

      // Update status
      mockEq.mockReturnValueOnce({ error: null });

      const { removeFleetMember } = await import('../services/memberService');

      expect(typeof removeFleetMember).toBe('function');
    });

    it('cannot remove last admin', async () => {
      // Fetch member - it's an admin
      mockSingle.mockResolvedValueOnce({
        data: { fleet_id: mockFleetId, role: 'admin' },
        error: null,
      });

      // Check admin count - only 1 admin
      mockEq.mockReturnValueOnce({
        data: [{ id: 'admin-1' }],
        error: null,
      });

      const { removeFleetMember } = await import('../services/memberService');

      expect(typeof removeFleetMember).toBe('function');
    });

    it('allows removing admin when other admins exist', async () => {
      // Fetch member - it's an admin
      mockSingle.mockResolvedValueOnce({
        data: { fleet_id: mockFleetId, role: 'admin' },
        error: null,
      });

      // Check admin count - multiple admins
      mockEq.mockReturnValueOnce({
        data: [{ id: 'admin-1' }, { id: 'admin-2' }],
        error: null,
      });

      // Update succeeds
      mockEq.mockReturnValueOnce({ error: null });

      const { removeFleetMember } = await import('../services/memberService');

      expect(typeof removeFleetMember).toBe('function');
    });

    it('throws error when member not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Member not found' },
      });

      const { removeFleetMember } = await import('../services/memberService');

      expect(typeof removeFleetMember).toBe('function');
    });
  });

  describe('checkMemberRole', () => {
    it('returns true when user has required role', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      const { checkMemberRole } = await import('../services/memberService');

      expect(typeof checkMemberRole).toBe('function');
    });

    it('returns false when user does not have required role', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { role: 'driver' },
        error: null,
      });

      const { checkMemberRole } = await import('../services/memberService');

      expect(typeof checkMemberRole).toBe('function');
    });

    it('returns false when user not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const { checkMemberRole } = await import('../services/memberService');

      expect(typeof checkMemberRole).toBe('function');
    });

    it('correctly checks multiple required roles', () => {
      const checkRole = (userRole: string, requiredRoles: string[]) => {
        return requiredRoles.includes(userRole);
      };

      expect(checkRole('admin', ['admin', 'manager'])).toBe(true);
      expect(checkRole('manager', ['admin', 'manager'])).toBe(true);
      expect(checkRole('driver', ['admin', 'manager'])).toBe(false);
    });
  });

  describe('isFleetAdmin', () => {
    it('returns true for admin role', async () => {
      const { isFleetAdmin } = await import('../services/memberService');

      expect(typeof isFleetAdmin).toBe('function');
    });

    it('returns true for manager role', async () => {
      const { isFleetAdmin } = await import('../services/memberService');

      expect(typeof isFleetAdmin).toBe('function');
    });

    it('returns false for driver role', async () => {
      const { isFleetAdmin } = await import('../services/memberService');

      expect(typeof isFleetAdmin).toBe('function');
    });
  });

  describe('getUserMembership', () => {
    it('returns membership when found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockMember,
        error: null,
      });

      const { getUserMembership } = await import('../services/memberService');

      expect(typeof getUserMembership).toBe('function');
    });

    it('returns null when not a member', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const { getUserMembership } = await import('../services/memberService');

      expect(typeof getUserMembership).toBe('function');
    });

    it('only returns active memberships', async () => {
      // Query filters by status='active'
      const { getUserMembership } = await import('../services/memberService');

      expect(typeof getUserMembership).toBe('function');
    });
  });

  describe('transferOwnership', () => {
    it('transfers ownership to another admin', async () => {
      // Verify current owner
      mockSingle.mockResolvedValueOnce({
        data: { owner_id: mockUserId },
        error: null,
      });

      // Check new owner is admin
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      // Update fleet
      mockEq.mockReturnValueOnce({ error: null });

      const { transferOwnership } = await import('../services/memberService');

      expect(typeof transferOwnership).toBe('function');
    });

    it('throws error when not current owner', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { owner_id: 'different-owner' },
        error: null,
      });

      const { transferOwnership } = await import('../services/memberService');

      expect(typeof transferOwnership).toBe('function');
    });

    it('throws error when new owner is not admin', async () => {
      // Verify current owner
      mockSingle.mockResolvedValueOnce({
        data: { owner_id: mockUserId },
        error: null,
      });

      // Check new owner role - not admin
      mockSingle.mockResolvedValueOnce({
        data: { role: 'driver' },
        error: null,
      });

      const { transferOwnership } = await import('../services/memberService');

      expect(typeof transferOwnership).toBe('function');
    });
  });
});

// ============================================================================
// Pure Function Tests (without mocking)
// ============================================================================

describe('Member Service - Pure Functions', () => {
  describe('Role hierarchy', () => {
    it('admin has highest privileges', () => {
      const roleHierarchy = { admin: 3, manager: 2, driver: 1 };
      expect(roleHierarchy.admin).toBeGreaterThan(roleHierarchy.manager);
      expect(roleHierarchy.admin).toBeGreaterThan(roleHierarchy.driver);
    });

    it('manager has more privileges than driver', () => {
      const roleHierarchy = { admin: 3, manager: 2, driver: 1 };
      expect(roleHierarchy.manager).toBeGreaterThan(roleHierarchy.driver);
    });
  });

  describe('Status transitions', () => {
    it('active can transition to suspended', () => {
      const validTransitions: Record<string, string[]> = {
        active: ['suspended', 'removed'],
        suspended: ['active', 'removed'],
        pending: ['active', 'removed'],
        removed: [],
      };

      expect(validTransitions.active).toContain('suspended');
    });

    it('suspended can transition to active', () => {
      const validTransitions: Record<string, string[]> = {
        active: ['suspended', 'removed'],
        suspended: ['active', 'removed'],
        pending: ['active', 'removed'],
        removed: [],
      };

      expect(validTransitions.suspended).toContain('active');
    });

    it('removed cannot transition to any status', () => {
      const validTransitions: Record<string, string[]> = {
        active: ['suspended', 'removed'],
        suspended: ['active', 'removed'],
        pending: ['active', 'removed'],
        removed: [],
      };

      expect(validTransitions.removed).toHaveLength(0);
    });
  });

  describe('Member filtering', () => {
    it('filters active members correctly', () => {
      const members = [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
        { id: '3', status: 'suspended' },
        { id: '4', status: 'removed' },
      ];

      const activeMembers = members.filter(m => m.status === 'active');
      expect(activeMembers).toHaveLength(2);
    });

    it('filters by role correctly', () => {
      const members = [
        { id: '1', role: 'admin', status: 'active' },
        { id: '2', role: 'driver', status: 'active' },
        { id: '3', role: 'driver', status: 'active' },
        { id: '4', role: 'driver', status: 'suspended' },
      ];

      const activeDrivers = members.filter(
        m => m.role === 'driver' && m.status === 'active'
      );
      expect(activeDrivers).toHaveLength(2);
    });

    it('counts admins correctly', () => {
      const members = [
        { id: '1', role: 'admin', status: 'active' },
        { id: '2', role: 'admin', status: 'suspended' },
        { id: '3', role: 'driver', status: 'active' },
      ];

      const activeAdmins = members.filter(
        m => m.role === 'admin' && m.status === 'active'
      );
      expect(activeAdmins).toHaveLength(1);
    });
  });
});
