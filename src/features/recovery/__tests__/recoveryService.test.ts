/**
 * Recovery Service Tests
 */

// Mock Supabase client before imports
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockLte = jest.fn();

const mockSupabase = {
  from: jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  })),
};

// Chain returns for query building
mockSelect.mockReturnValue({
  eq: mockEq,
  order: mockOrder,
  lte: mockLte,
});

mockInsert.mockReturnValue({
  select: jest.fn().mockReturnValue({
    single: mockSingle,
  }),
});

mockUpdate.mockReturnValue({
  eq: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: mockSingle,
    }),
  }),
});

mockEq.mockReturnValue({
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
  lte: mockLte,
  select: jest.fn().mockReturnValue({
    single: mockSingle,
  }),
});

mockOrder.mockReturnValue({
  data: [],
  error: null,
});

mockLte.mockReturnValue({
  data: [],
  error: null,
});

jest.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}));

import {
  fetchRecoveryStats,
  fetchInvoiceTracking,
  createInvoiceTracking,
  updateInvoiceTracking,
  markInvoicePaid,
  markInvoicePartialPaid,
  calculateAgingBucket,
  fetchAgingInvoices,
  calculateAgingBuckets,
  calculateROI,
  recordReminderSent,
  fetchInvoicesDueForReminder,
} from '../services/recoveryService';
import type { RecoveryStats, AgingInvoice } from '@/shared/types/recovery';

// ============================================================================
// Test Data
// ============================================================================

const mockStats: RecoveryStats = {
  total_invoices: 10,
  pending_count: 3,
  paid_count: 7,
  partial_count: 0,
  total_invoiced: 5000,
  total_received: 3500,
  pending_amount: 1500,
  paid_amount: 3500,
  collection_rate: 70,
  avg_days_to_payment: 15,
};

const mockTracking = {
  id: 'tracking-1',
  invoice_id: 'invoice-1',
  amount_invoiced: 500,
  payment_status: 'pending',
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Recovery Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock chains
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      lte: mockLte,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      lte: mockLte,
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
  });

  describe('fetchRecoveryStats', () => {
    it('should fetch recovery stats for a user', async () => {
      mockSingle.mockResolvedValue({ data: mockStats, error: null });

      const result = await fetchRecoveryStats('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('recovery_stats');
      expect(result).toEqual(mockStats);
    });

    it('should return default stats if no data found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await fetchRecoveryStats('user-123');

      expect(result).toEqual({
        total_invoices: 0,
        pending_count: 0,
        paid_count: 0,
        partial_count: 0,
        total_invoiced: 0,
        total_received: 0,
        pending_amount: 0,
        paid_amount: 0,
        collection_rate: 0,
        avg_days_to_payment: null,
      });
    });

    it('should throw error on database failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Database error' },
      });

      await expect(fetchRecoveryStats('user-123')).rejects.toThrow(
        'Failed to fetch recovery stats'
      );
    });
  });

  describe('fetchInvoiceTracking', () => {
    it('should fetch invoice tracking record', async () => {
      mockSingle.mockResolvedValue({ data: mockTracking, error: null });

      const result = await fetchInvoiceTracking('invoice-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('invoice_tracking');
      expect(result).toEqual(mockTracking);
    });

    it('should return null if not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await fetchInvoiceTracking('invoice-1');

      expect(result).toBeNull();
    });
  });

  describe('createInvoiceTracking', () => {
    it('should create invoice tracking record', async () => {
      const input = {
        invoice_id: 'invoice-1',
        user_id: 'user-1',
        amount_invoiced: 500,
      };

      const mockCreated = {
        id: 'tracking-1',
        ...input,
        payment_status: 'pending',
        amount_received: 0,
      };

      mockSingle.mockResolvedValue({ data: mockCreated, error: null });

      const result = await createInvoiceTracking(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('invoice_tracking');
      expect(result).toEqual(mockCreated);
    });

    it('should throw error on failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(
        createInvoiceTracking({
          invoice_id: 'invoice-1',
          user_id: 'user-1',
          amount_invoiced: 500,
        })
      ).rejects.toThrow('Failed to create invoice tracking');
    });
  });

  describe('updateInvoiceTracking', () => {
    it('should update invoice tracking record', async () => {
      const mockUpdated = {
        id: 'tracking-1',
        payment_status: 'paid',
        amount_received: 500,
      };

      mockSingle.mockResolvedValue({ data: mockUpdated, error: null });

      const result = await updateInvoiceTracking('tracking-1', {
        payment_status: 'paid',
        amount_received: 500,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('invoice_tracking');
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('markInvoicePaid', () => {
    it('should mark invoice as paid', async () => {
      const mockUpdated = {
        id: 'tracking-1',
        payment_status: 'paid',
        amount_received: 500,
      };

      mockSingle.mockResolvedValue({ data: mockUpdated, error: null });

      const result = await markInvoicePaid('tracking-1', 500);

      expect(result.payment_status).toBe('paid');
    });
  });

  describe('markInvoicePartialPaid', () => {
    it('should mark invoice as partially paid', async () => {
      const mockUpdated = {
        id: 'tracking-1',
        payment_status: 'partial',
        amount_received: 250,
      };

      mockSingle.mockResolvedValue({ data: mockUpdated, error: null });

      const result = await markInvoicePartialPaid('tracking-1', 250);

      expect(result.payment_status).toBe('partial');
    });
  });

  describe('calculateAgingBucket', () => {
    it('should return "current" for 0-14 days', () => {
      expect(calculateAgingBucket(0)).toBe('current');
      expect(calculateAgingBucket(7)).toBe('current');
      expect(calculateAgingBucket(14)).toBe('current');
    });

    it('should return "aging" for 15-30 days', () => {
      expect(calculateAgingBucket(15)).toBe('aging');
      expect(calculateAgingBucket(22)).toBe('aging');
      expect(calculateAgingBucket(30)).toBe('aging');
    });

    it('should return "overdue" for 31-60 days', () => {
      expect(calculateAgingBucket(31)).toBe('overdue');
      expect(calculateAgingBucket(45)).toBe('overdue');
      expect(calculateAgingBucket(60)).toBe('overdue');
    });

    it('should return "critical" for 61+ days', () => {
      expect(calculateAgingBucket(61)).toBe('critical');
      expect(calculateAgingBucket(90)).toBe('critical');
      expect(calculateAgingBucket(180)).toBe('critical');
    });
  });

  describe('fetchAgingInvoices', () => {
    it('should fetch and transform aging invoices', async () => {
      const mockData = [
        {
          id: 'tracking-1',
          invoice_id: 'invoice-1',
          amount_invoiced: 500,
          amount_received: 0,
          payment_status: 'pending',
          reminder_count: 0,
          next_reminder_at: null,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          invoices: {
            invoice_number: 'INV-001',
            recipient_email: 'test@example.com',
            sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            detention_events: [{ facilities: { name: 'Test Facility' } }],
          },
        },
      ];

      mockOrder.mockReturnValue({ data: mockData, error: null });

      const result = await fetchAgingInvoices('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].invoice_number).toBe('INV-001');
      expect(result[0].aging_bucket).toBe('current');
      expect(result[0].facility_name).toBe('Test Facility');
    });

    it('should handle database errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(fetchAgingInvoices('user-123')).rejects.toThrow(
        'Failed to fetch aging invoices'
      );
    });
  });

  describe('calculateAgingBuckets', () => {
    it('should group invoices by aging bucket', () => {
      const invoices: AgingInvoice[] = [
        {
          id: '1',
          invoice_id: 'inv-1',
          invoice_number: 'INV-001',
          recipient_email: null,
          amount_invoiced: 100,
          amount_received: 0,
          payment_status: 'pending',
          sent_at: new Date().toISOString(),
          days_outstanding: 5,
          aging_bucket: 'current',
          facility_name: null,
          reminder_count: 0,
          next_reminder_at: null,
        },
        {
          id: '2',
          invoice_id: 'inv-2',
          invoice_number: 'INV-002',
          recipient_email: null,
          amount_invoiced: 200,
          amount_received: 0,
          payment_status: 'pending',
          sent_at: new Date().toISOString(),
          days_outstanding: 20,
          aging_bucket: 'aging',
          facility_name: null,
          reminder_count: 0,
          next_reminder_at: null,
        },
        {
          id: '3',
          invoice_id: 'inv-3',
          invoice_number: 'INV-003',
          recipient_email: null,
          amount_invoiced: 300,
          amount_received: 50,
          payment_status: 'pending',
          sent_at: new Date().toISOString(),
          days_outstanding: 45,
          aging_bucket: 'overdue',
          facility_name: null,
          reminder_count: 1,
          next_reminder_at: null,
        },
      ];

      const result = calculateAgingBuckets(invoices);

      expect(result).toHaveLength(4);

      const currentBucket = result.find((b) => b.bucket === 'current');
      expect(currentBucket?.count).toBe(1);
      expect(currentBucket?.amount).toBe(100);

      const agingBucket = result.find((b) => b.bucket === 'aging');
      expect(agingBucket?.count).toBe(1);
      expect(agingBucket?.amount).toBe(200);

      const overdueBucket = result.find((b) => b.bucket === 'overdue');
      expect(overdueBucket?.count).toBe(1);
      expect(overdueBucket?.amount).toBe(250);

      const criticalBucket = result.find((b) => b.bucket === 'critical');
      expect(criticalBucket?.count).toBe(0);
      expect(criticalBucket?.amount).toBe(0);
    });

    it('should return empty buckets for empty input', () => {
      const result = calculateAgingBuckets([]);

      expect(result).toHaveLength(4);
      result.forEach((bucket) => {
        expect(bucket.count).toBe(0);
        expect(bucket.amount).toBe(0);
      });
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      const result = calculateROI(mockStats, 12.99);

      expect(result.total_documented).toBe(5000);
      expect(result.total_collected).toBe(3500);
      expect(result.pending_amount).toBe(1500);
      expect(result.subscription_cost).toBe(12.99);
      expect(result.roi_multiplier).toBeCloseTo(269.4, 1);
      expect(result.net_gain).toBeCloseTo(3487.01, 2);
    });

    it('should handle zero subscription cost', () => {
      const stats: RecoveryStats = {
        ...mockStats,
        total_received: 500,
      };

      const result = calculateROI(stats, 0);

      expect(result.roi_multiplier).toBe(0);
      expect(result.net_gain).toBe(500);
    });

    it('should use default subscription cost of 12.99', () => {
      const result = calculateROI(mockStats);

      expect(result.subscription_cost).toBe(12.99);
    });
  });

  describe('recordReminderSent', () => {
    it('should increment reminder count', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { reminder_count: 0 },
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'tracking-1',
          reminder_count: 1,
          last_reminder_at: new Date().toISOString(),
        },
        error: null,
      });

      const result = await recordReminderSent('tracking-1');

      expect(result.reminder_count).toBe(1);
    });

    it('should throw error on failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Fetch failed' },
      });

      await expect(recordReminderSent('tracking-1')).rejects.toThrow(
        'Failed to fetch tracking'
      );
    });
  });

  describe('fetchInvoicesDueForReminder', () => {
    it('should fetch invoices due for reminder', async () => {
      const mockData = [
        {
          id: 'tracking-1',
          invoice_id: 'invoice-1',
          amount_invoiced: 500,
          amount_received: 0,
          payment_status: 'pending',
          reminder_count: 1,
          next_reminder_at: new Date(Date.now() - 1000).toISOString(),
          invoices: {
            invoice_number: 'INV-001',
            recipient_email: 'test@example.com',
            sent_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ];

      mockLte.mockReturnValue({ data: mockData, error: null });

      const result = await fetchInvoicesDueForReminder('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].invoice_number).toBe('INV-001');
    });
  });
});
