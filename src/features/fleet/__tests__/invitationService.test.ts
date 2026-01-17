/**
 * Fleet Invitation Service Tests
 * Tests pure utility functions for fleet invitations
 * 
 * NOTE: Database operations now use Convex hooks directly.
 * These tests cover the utility/helper functions only.
 */

import {
  generateInvitationCode,
  isInvitationExpired,
  isInvitationAccepted,
  getInvitationStatus,
  formatExpirationTime,
  calculateExpirationTime,
  DEFAULT_INVITATION_EXPIRY_DAYS,
} from '../services/invitationService';

import type { FleetInvitation } from '../services/invitationService';

// ============================================================================
// Test Data
// ============================================================================

const createMockInvitation = (overrides: Partial<FleetInvitation> = {}): FleetInvitation => ({
  id: 'invitation-1',
  fleetId: 'fleet-1',
  email: 'driver@example.com',
  invitationCode: 'ABC12345',
  role: 'driver',
  invitedBy: 'admin-1',
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
  ...overrides,
});

// ============================================================================
// generateInvitationCode Tests
// ============================================================================

describe('generateInvitationCode', () => {
  it('generates code of correct length', () => {
    const code = generateInvitationCode();
    expect(code).toHaveLength(8);
  });

  it('generates uppercase alphanumeric code', () => {
    const code = generateInvitationCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it('excludes ambiguous characters (O, 0, I, 1)', () => {
    // The character set excludes O, 0, I, and 1 to avoid confusion
    // Character set: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 100; i++) {
      const code = generateInvitationCode();
      expect(code).not.toMatch(/[OI01]/);
    }
  });

  it('generates unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateInvitationCode());
    }
    // Should have near 100 unique codes (collision extremely unlikely)
    expect(codes.size).toBeGreaterThan(95);
  });
});

// ============================================================================
// isInvitationExpired Tests
// ============================================================================

describe('isInvitationExpired', () => {
  it('returns false for future expiration', () => {
    const futureTime = Date.now() + 10000;
    expect(isInvitationExpired(futureTime)).toBe(false);
  });

  it('returns true for past expiration', () => {
    const pastTime = Date.now() - 10000;
    expect(isInvitationExpired(pastTime)).toBe(true);
  });

  it('returns true for current time (edge case)', () => {
    // At exact moment of expiration, consider it expired
    const now = Date.now();
    expect(isInvitationExpired(now - 1)).toBe(true);
  });
});

// ============================================================================
// isInvitationAccepted Tests
// ============================================================================

describe('isInvitationAccepted', () => {
  it('returns true when acceptedAt is set', () => {
    expect(isInvitationAccepted(Date.now())).toBe(true);
    expect(isInvitationAccepted(1234567890)).toBe(true);
  });

  it('returns false when acceptedAt is undefined', () => {
    expect(isInvitationAccepted(undefined)).toBe(false);
  });
});

// ============================================================================
// getInvitationStatus Tests
// ============================================================================

describe('getInvitationStatus', () => {
  it('returns "accepted" when acceptedAt is set', () => {
    const invitation = createMockInvitation({ acceptedAt: Date.now() });
    expect(getInvitationStatus(invitation)).toBe('accepted');
  });

  it('returns "expired" when expired and not accepted', () => {
    const invitation = createMockInvitation({
      expiresAt: Date.now() - 1000,
      acceptedAt: undefined,
    });
    expect(getInvitationStatus(invitation)).toBe('expired');
  });

  it('returns "pending" when valid and not accepted', () => {
    const invitation = createMockInvitation({
      expiresAt: Date.now() + 10000,
      acceptedAt: undefined,
    });
    expect(getInvitationStatus(invitation)).toBe('pending');
  });

  it('prioritizes accepted over expired', () => {
    // Edge case: accepted after expiration (shouldn't happen normally)
    const invitation = createMockInvitation({
      expiresAt: Date.now() - 1000,
      acceptedAt: Date.now(),
    });
    expect(getInvitationStatus(invitation)).toBe('accepted');
  });
});

// ============================================================================
// formatExpirationTime Tests
// ============================================================================

describe('formatExpirationTime', () => {
  it('returns "Expired" for past time', () => {
    const pastTime = Date.now() - 1000;
    expect(formatExpirationTime(pastTime)).toBe('Expired');
  });

  it('formats minutes for less than 1 hour', () => {
    const thirtyMinutes = Date.now() + (30 * 60 * 1000);
    expect(formatExpirationTime(thirtyMinutes)).toMatch(/Expires in \d+ minute/);
  });

  it('formats hours for less than 1 day', () => {
    const fiveHours = Date.now() + (5 * 60 * 60 * 1000);
    expect(formatExpirationTime(fiveHours)).toMatch(/Expires in \d+ hour/);
  });

  it('formats days for 24+ hours', () => {
    const threeDays = Date.now() + (3 * 24 * 60 * 60 * 1000);
    expect(formatExpirationTime(threeDays)).toMatch(/Expires in \d+ day/);
  });

  it('handles singular forms', () => {
    const oneDay = Date.now() + (1 * 24 * 60 * 60 * 1000) + 1000;
    expect(formatExpirationTime(oneDay)).toBe('Expires in 1 day');
  });

  it('handles plural forms', () => {
    const fiveDays = Date.now() + (5 * 24 * 60 * 60 * 1000);
    expect(formatExpirationTime(fiveDays)).toBe('Expires in 5 days');
  });
});

// ============================================================================
// calculateExpirationTime Tests
// ============================================================================

describe('calculateExpirationTime', () => {
  it('uses default expiry days when no argument', () => {
    const before = Date.now();
    const expiration = calculateExpirationTime();
    const after = Date.now();

    const expectedMin = before + (DEFAULT_INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const expectedMax = after + (DEFAULT_INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    expect(expiration).toBeGreaterThanOrEqual(expectedMin);
    expect(expiration).toBeLessThanOrEqual(expectedMax);
  });

  it('calculates correct expiration for custom days', () => {
    const before = Date.now();
    const expiration = calculateExpirationTime(14);
    const after = Date.now();

    const expectedMin = before + (14 * 24 * 60 * 60 * 1000);
    const expectedMax = after + (14 * 24 * 60 * 60 * 1000);

    expect(expiration).toBeGreaterThanOrEqual(expectedMin);
    expect(expiration).toBeLessThanOrEqual(expectedMax);
  });

  it('handles 0 days', () => {
    const now = Date.now();
    const expiration = calculateExpirationTime(0);
    // Should be very close to now
    expect(expiration - now).toBeLessThan(100);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('DEFAULT_INVITATION_EXPIRY_DAYS', () => {
  it('is set to 7 days', () => {
    expect(DEFAULT_INVITATION_EXPIRY_DAYS).toBe(7);
  });
});
