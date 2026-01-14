/**
 * Payment Stats Service Tests
 */

// Mock Supabase client before imports
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockUpsert = jest.fn();
const mockEq = jest.fn();
const mockIs = jest.fn();
const mockLte = jest.fn();
const mockNot = jest.fn();
const mockGte = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockSingle = jest.fn();

const mockSupabase = {
  from: jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    upsert: mockUpsert,
  })),
};

// Setup chain returns
mockSelect.mockReturnValue({
  eq: mockEq,
  is: mockIs,
  lte: mockLte,
  not: mockNot,
  gte: mockGte,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
});

mockEq.mockReturnValue({
  eq: mockEq,
  is: mockIs,
  lte: mockLte,
  order: mockOrder,
  single: mockSingle,
  select: jest.fn().mockReturnValue({ single: mockSingle }),
});

mockIs.mockReturnValue({
  lte: mockLte,
  order: mockOrder,
});

mockLte.mockReturnValue({
  order: mockOrder,
});

mockNot.mockReturnValue({
  order: mockOrder,
});

mockGte.mockReturnValue({
  not: mockNot,
});

mockOrder.mockReturnValue({
  limit: mockLimit,
  data: [],
  error: null,
});

mockLimit.mockReturnValue({
  data: [],
  error: null,
});

mockInsert.mockReturnValue({
  select: jest.fn().mockReturnValue({ single: mockSingle }),
});

mockUpdate.mockReturnValue({
  eq: mockEq,
});

mockUpsert.mockReturnValue({
  data: null,
  error: null,
});

jest.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}));

import {
  fetchFacilityPaymentStats,
  getFacilityReliability,
  schedulePaymentFollowUp,
  fetchPendingFollowUps,
  recordPaymentResponse,
  autoScheduleFollowUp,
  fetchFacilitiesByPaymentRate,
} from '../services/paymentStatsService';
import type { FacilityPaymentStats } from '@/shared/types/payment-tracking';

// ============================================================================
// Test Data
// ============================================================================

const mockPaymentStats: FacilityPaymentStats = {
  facility_id: 'facility-123',
  facility_name: 'Test Warehouse',
  total_claims: 10,
  paid_claims: 8,
  unpaid_claims: 2,
  payment_rate: 80,
  avg_payment_days: 25,
  avg_payment_amount: 450.00,
  partial_payments: 1,
  last_report_date: '2024-01-15T00:00:00Z',
};

const mockFollowUp = {
  id: 'followup-123',
  user_id: 'user-123',
  invoice_id: 'invoice-123',
  tracking_id: 'tracking-123',
  facility_id: 'facility-123',
  scheduled_for: new Date().toISOString(),
  sent_at: null,
  responded_at: null,
  response: null,
  payment_amount: null,
  payment_days: null,
  notes: null,
  created_at: new Date().toISOString(),
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Payment Stats Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock chains
    mockSelect.mockReturnValue({
      eq: mockEq,
      is: mockIs,
      lte: mockLte,
      not: mockNot,
      gte: mockGte,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      is: mockIs,
      lte: mockLte,
      order: mockOrder,
      single: mockSingle,
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    });
  });

  describe('fetchFacilityPaymentStats', () => {
    it('should fetch payment stats for a facility', async () => {
      mockSingle.mockResolvedValue({ data: mockPaymentStats, error: null });

      const result = await fetchFacilityPaymentStats('facility-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('facility_payment_stats');
      expect(result).toEqual(mockPaymentStats);
    });

    it('should return null if no stats found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await fetchFacilityPaymentStats('facility-123');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Database error' },
      });

      await expect(fetchFacilityPaymentStats('facility-123')).rejects.toThrow(
        'Failed to fetch payment stats'
      );
    });
  });

  describe('getFacilityReliability', () => {
    it('should return reliability summary for facility with data', async () => {
      mockSingle.mockResolvedValue({ data: mockPaymentStats, error: null });

      const result = await getFacilityReliability('facility-123');

      expect(result.paymentRate).toBe(80);
      expect(result.reliability).toBe('excellent');
      expect(result.totalClaims).toBe(10);
    });

    it('should return unknown reliability for facility without data', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await getFacilityReliability('facility-123');

      expect(result.reliability).toBe('unknown');
      expect(result.totalClaims).toBe(0);
    });
  });

  describe('schedulePaymentFollowUp', () => {
    it('should schedule a follow-up', async () => {
      mockSingle.mockResolvedValue({ data: mockFollowUp, error: null });

      const input = {
        user_id: 'user-123',
        invoice_id: 'invoice-123',
        scheduled_for: new Date().toISOString(),
      };

      const result = await schedulePaymentFollowUp(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('payment_follow_ups');
      expect(result).toEqual(mockFollowUp);
    });

    it('should throw error on failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(
        schedulePaymentFollowUp({
          user_id: 'user-123',
          invoice_id: 'invoice-123',
          scheduled_for: new Date().toISOString(),
        })
      ).rejects.toThrow('Failed to schedule follow-up');
    });
  });

  describe('fetchPendingFollowUps', () => {
    it('should fetch pending follow-ups', async () => {
      mockOrder.mockReturnValue({ data: [mockFollowUp], error: null });

      const result = await fetchPendingFollowUps('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('followup-123');
    });

    it('should return empty array on error', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Fetch failed' },
      });

      await expect(fetchPendingFollowUps('user-123')).rejects.toThrow(
        'Failed to fetch follow-ups'
      );
    });
  });

  describe('recordPaymentResponse', () => {
    it('should record payment response', async () => {
      const updatedFollowUp = {
        ...mockFollowUp,
        response: 'paid_full',
        responded_at: new Date().toISOString(),
      };

      mockSingle.mockResolvedValueOnce({ data: updatedFollowUp, error: null });

      const result = await recordPaymentResponse({
        follow_up_id: 'followup-123',
        response: 'paid_full',
        payment_amount: 500,
        payment_days: 30,
      });

      expect(result.response).toBe('paid_full');
    });
  });

  describe('autoScheduleFollowUp', () => {
    it('should schedule follow-up if none exists', async () => {
      // First query returns no existing follow-up
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // Insert returns new follow-up
      mockSingle.mockResolvedValueOnce({ data: mockFollowUp, error: null });

      const result = await autoScheduleFollowUp('invoice-123', 'user-123');

      expect(result).not.toBeNull();
    });

    it('should return null if follow-up already exists', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'existing' }, error: null });

      const result = await autoScheduleFollowUp('invoice-123', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('fetchFacilitiesByPaymentRate', () => {
    it('should fetch best paying facilities', async () => {
      // Set up complete mock chain for this query pattern: .select().gte().not().order().limit()
      const mockLimitFn = jest.fn().mockReturnValue({
        data: [mockPaymentStats],
        error: null,
      });
      const mockOrderFn = jest.fn().mockReturnValue({ limit: mockLimitFn });
      const mockNotFn = jest.fn().mockReturnValue({ order: mockOrderFn });
      const mockGteFn = jest.fn().mockReturnValue({ not: mockNotFn });
      mockSelect.mockReturnValue({ gte: mockGteFn });

      const result = await fetchFacilitiesByPaymentRate('best', 10);

      expect(result).toHaveLength(1);
      expect(result[0].payment_rate).toBe(80);
    });

    it('should fetch worst paying facilities', async () => {
      const worstStats = { ...mockPaymentStats, payment_rate: 20 };
      // Set up complete mock chain for this query pattern
      const mockLimitFn = jest.fn().mockReturnValue({
        data: [worstStats],
        error: null,
      });
      const mockOrderFn = jest.fn().mockReturnValue({ limit: mockLimitFn });
      const mockNotFn = jest.fn().mockReturnValue({ order: mockOrderFn });
      const mockGteFn = jest.fn().mockReturnValue({ not: mockNotFn });
      mockSelect.mockReturnValue({ gte: mockGteFn });

      const result = await fetchFacilitiesByPaymentRate('worst', 10);

      expect(result).toHaveLength(1);
    });
  });
});

describe('Reliability Level Calculation', () => {
  // Import the helper functions
  const { getReliabilityLevel, getReliabilityColor } = require('@/shared/types/payment-tracking');

  it('should return "excellent" for 80%+ with enough claims', () => {
    expect(getReliabilityLevel(85, 10)).toBe('excellent');
    expect(getReliabilityLevel(100, 5)).toBe('excellent');
  });

  it('should return "good" for 60-79%', () => {
    expect(getReliabilityLevel(75, 10)).toBe('good');
    expect(getReliabilityLevel(60, 5)).toBe('good');
  });

  it('should return "fair" for 40-59%', () => {
    expect(getReliabilityLevel(50, 10)).toBe('fair');
    expect(getReliabilityLevel(40, 5)).toBe('fair');
  });

  it('should return "poor" for under 40%', () => {
    expect(getReliabilityLevel(30, 10)).toBe('poor');
    expect(getReliabilityLevel(10, 5)).toBe('poor');
  });

  it('should return "unknown" for insufficient claims', () => {
    expect(getReliabilityLevel(90, 2)).toBe('unknown');
    expect(getReliabilityLevel(null, 10)).toBe('unknown');
  });

  it('should return correct colors', () => {
    expect(getReliabilityColor('excellent')).toBe('#22C55E');
    expect(getReliabilityColor('good')).toBe('#84CC16');
    expect(getReliabilityColor('fair')).toBe('#F59E0B');
    expect(getReliabilityColor('poor')).toBe('#EF4444');
    expect(getReliabilityColor('unknown')).toBe('#6B7280');
  });
});
