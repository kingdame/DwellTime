/**
 * Fleet Service Tests
 * Tests pure utility functions for fleet management
 * 
 * NOTE: Database operations now use Convex hooks directly.
 * These tests cover the utility/helper functions only.
 */

import {
  calculateFleetStats,
  formatMemberRole,
  formatMemberStatus,
  getMemberStatusColor,
} from '../services/fleetService';

// ============================================================================
// Test Data
// ============================================================================

const mockMembers = [
  { status: 'active' },
  { status: 'active' },
  { status: 'suspended' },
  { status: 'removed' },
  { status: 'pending' },
];

const mockEvents = [
  { status: 'active', totalAmount: 100, detentionMinutes: 60 },
  { status: 'completed', totalAmount: 150, detentionMinutes: 90 },
  { status: 'invoiced', totalAmount: 200, detentionMinutes: 120 },
  { status: 'paid', totalAmount: 75, detentionMinutes: 45 },
];

// ============================================================================
// calculateFleetStats Tests
// ============================================================================

describe('calculateFleetStats', () => {
  it('calculates total drivers correctly', () => {
    const stats = calculateFleetStats(mockMembers, mockEvents);
    expect(stats.totalDrivers).toBe(5);
  });

  it('calculates active drivers correctly', () => {
    const stats = calculateFleetStats(mockMembers, mockEvents);
    expect(stats.activeDrivers).toBe(2);
  });

  it('calculates active events correctly', () => {
    const stats = calculateFleetStats(mockMembers, mockEvents);
    expect(stats.activeEvents).toBe(1);
  });

  it('calculates total earnings from completed/invoiced/paid events', () => {
    const stats = calculateFleetStats(mockMembers, mockEvents);
    // completed (150) + invoiced (200) + paid (75) = 425
    expect(stats.totalEarnings).toBe(425);
  });

  it('calculates total detention minutes from completed/invoiced/paid events', () => {
    const stats = calculateFleetStats(mockMembers, mockEvents);
    // completed (90) + invoiced (120) + paid (45) = 255
    expect(stats.totalDetentionMinutes).toBe(255);
  });

  it('handles empty members array', () => {
    const stats = calculateFleetStats([], mockEvents);
    expect(stats.totalDrivers).toBe(0);
    expect(stats.activeDrivers).toBe(0);
  });

  it('handles empty events array', () => {
    const stats = calculateFleetStats(mockMembers, []);
    expect(stats.totalEarnings).toBe(0);
    expect(stats.totalDetentionMinutes).toBe(0);
    expect(stats.activeEvents).toBe(0);
  });
});

// ============================================================================
// formatMemberRole Tests
// ============================================================================

describe('formatMemberRole', () => {
  it('formats admin role', () => {
    expect(formatMemberRole('admin')).toBe('Admin');
  });

  it('formats driver role', () => {
    expect(formatMemberRole('driver')).toBe('Driver');
  });
});

// ============================================================================
// formatMemberStatus Tests
// ============================================================================

describe('formatMemberStatus', () => {
  it('formats active status', () => {
    expect(formatMemberStatus('active')).toBe('Active');
  });

  it('formats pending status', () => {
    expect(formatMemberStatus('pending')).toBe('Pending');
  });

  it('formats suspended status', () => {
    expect(formatMemberStatus('suspended')).toBe('Suspended');
  });

  it('formats removed status', () => {
    expect(formatMemberStatus('removed')).toBe('Removed');
  });

  it('returns original for unknown status', () => {
    expect(formatMemberStatus('custom')).toBe('custom');
  });
});

// ============================================================================
// getMemberStatusColor Tests
// ============================================================================

describe('getMemberStatusColor', () => {
  it('returns green for active', () => {
    expect(getMemberStatusColor('active')).toBe('#10B981');
  });

  it('returns yellow for pending', () => {
    expect(getMemberStatusColor('pending')).toBe('#F59E0B');
  });

  it('returns red for suspended', () => {
    expect(getMemberStatusColor('suspended')).toBe('#EF4444');
  });

  it('returns gray for removed', () => {
    expect(getMemberStatusColor('removed')).toBe('#6B7280');
  });

  it('returns gray for unknown status', () => {
    expect(getMemberStatusColor('custom')).toBe('#6B7280');
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  it('handles all suspended members', () => {
    const allSuspended = [
      { status: 'suspended' },
      { status: 'suspended' },
    ];
    const stats = calculateFleetStats(allSuspended, []);
    expect(stats.activeDrivers).toBe(0);
    expect(stats.totalDrivers).toBe(2);
  });

  it('handles only active events', () => {
    const activeOnly = [
      { status: 'active', totalAmount: 100, detentionMinutes: 60 },
      { status: 'active', totalAmount: 200, detentionMinutes: 120 },
    ];
    const stats = calculateFleetStats([], activeOnly);
    expect(stats.activeEvents).toBe(2);
    expect(stats.totalEarnings).toBe(0); // Active events don't count toward earnings
  });

  it('handles large numbers correctly', () => {
    const events = [
      { status: 'paid', totalAmount: 10000, detentionMinutes: 6000 },
      { status: 'paid', totalAmount: 25000, detentionMinutes: 15000 },
    ];
    const stats = calculateFleetStats([], events);
    expect(stats.totalEarnings).toBe(35000);
    expect(stats.totalDetentionMinutes).toBe(21000);
  });
});
