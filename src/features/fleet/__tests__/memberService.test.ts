/**
 * Fleet Member Service Tests
 * Tests pure utility functions for fleet member management
 * 
 * NOTE: Database operations now use Convex hooks directly.
 * These tests cover the utility/helper functions only.
 */

import {
  canManageMembers,
  canInviteDrivers,
  canViewAnalytics,
  canEditSettings,
  getEffectiveHourlyRate,
  getEffectiveGracePeriod,
} from '../services/memberService';

import type { FleetMember } from '../services/memberService';

// ============================================================================
// Test Data
// ============================================================================

const createMockMember = (overrides: Partial<FleetMember> = {}): FleetMember => ({
  id: 'member-1',
  fleetId: 'fleet-1',
  userId: 'user-1',
  role: 'driver',
  status: 'active',
  ...overrides,
});

// ============================================================================
// Permission Tests
// ============================================================================

describe('canManageMembers', () => {
  it('returns true for admin role', () => {
    expect(canManageMembers('admin')).toBe(true);
  });

  it('returns false for driver role', () => {
    expect(canManageMembers('driver')).toBe(false);
  });

  it('returns false for undefined role', () => {
    expect(canManageMembers(undefined)).toBe(false);
  });
});

describe('canInviteDrivers', () => {
  it('returns true for admin role', () => {
    expect(canInviteDrivers('admin')).toBe(true);
  });

  it('returns false for driver role', () => {
    expect(canInviteDrivers('driver')).toBe(false);
  });

  it('returns false for undefined role', () => {
    expect(canInviteDrivers(undefined)).toBe(false);
  });
});

describe('canViewAnalytics', () => {
  it('returns true for admin role', () => {
    expect(canViewAnalytics('admin')).toBe(true);
  });

  it('returns false for driver role', () => {
    expect(canViewAnalytics('driver')).toBe(false);
  });

  it('returns false for undefined role', () => {
    expect(canViewAnalytics(undefined)).toBe(false);
  });
});

describe('canEditSettings', () => {
  it('returns true for admin role', () => {
    expect(canEditSettings('admin')).toBe(true);
  });

  it('returns false for driver role', () => {
    expect(canEditSettings('driver')).toBe(false);
  });

  it('returns false for undefined role', () => {
    expect(canEditSettings(undefined)).toBe(false);
  });
});

// ============================================================================
// Effective Rate Tests
// ============================================================================

describe('getEffectiveHourlyRate', () => {
  it('returns fleet default when no override', () => {
    const member = createMockMember();
    expect(getEffectiveHourlyRate(member, 75)).toBe(75);
  });

  it('returns member override when set', () => {
    const member = createMockMember({
      settingsOverride: { hourlyRate: 100 },
    });
    expect(getEffectiveHourlyRate(member, 75)).toBe(100);
  });

  it('handles override object without hourlyRate', () => {
    const member = createMockMember({
      settingsOverride: { gracePeriodMinutes: 90 },
    });
    expect(getEffectiveHourlyRate(member, 75)).toBe(75);
  });

  it('handles zero hourly rate override', () => {
    const member = createMockMember({
      settingsOverride: { hourlyRate: 0 },
    });
    // 0 is falsy but valid, should return 0
    expect(getEffectiveHourlyRate(member, 75)).toBe(0);
  });
});

describe('getEffectiveGracePeriod', () => {
  it('returns fleet default when no override', () => {
    const member = createMockMember();
    expect(getEffectiveGracePeriod(member, 120)).toBe(120);
  });

  it('returns member override when set', () => {
    const member = createMockMember({
      settingsOverride: { gracePeriodMinutes: 90 },
    });
    expect(getEffectiveGracePeriod(member, 120)).toBe(90);
  });

  it('handles override object without gracePeriodMinutes', () => {
    const member = createMockMember({
      settingsOverride: { hourlyRate: 100 },
    });
    expect(getEffectiveGracePeriod(member, 120)).toBe(120);
  });

  it('handles zero grace period override', () => {
    const member = createMockMember({
      settingsOverride: { gracePeriodMinutes: 0 },
    });
    // 0 is falsy but valid, should return 0
    expect(getEffectiveGracePeriod(member, 120)).toBe(0);
  });
});

// ============================================================================
// Combined Settings Override Tests
// ============================================================================

describe('Settings Override Combinations', () => {
  it('handles both overrides set', () => {
    const member = createMockMember({
      settingsOverride: {
        hourlyRate: 100,
        gracePeriodMinutes: 90,
      },
    });

    expect(getEffectiveHourlyRate(member, 75)).toBe(100);
    expect(getEffectiveGracePeriod(member, 120)).toBe(90);
  });

  it('handles empty settingsOverride object', () => {
    const member = createMockMember({
      settingsOverride: {},
    });

    expect(getEffectiveHourlyRate(member, 75)).toBe(75);
    expect(getEffectiveGracePeriod(member, 120)).toBe(120);
  });
});
