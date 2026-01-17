/**
 * Payment Stats Service Tests
 * Tests pure utility functions for payment statistics
 * 
 * NOTE: Database operations now use Convex hooks directly.
 * These tests cover the utility/helper functions only.
 */

import {
  calculatePaymentRate,
  formatPaymentRate,
  formatAvgPaymentDays,
  getPaymentReliabilityLabel,
  getPaymentReliabilityColor,
} from '../services/paymentStatsService';

// ============================================================================
// calculatePaymentRate Tests
// ============================================================================

describe('calculatePaymentRate', () => {
  it('calculates correct percentage for paid vs invoiced', () => {
    expect(calculatePaymentRate(80, 100)).toBe(80);
    expect(calculatePaymentRate(50, 100)).toBe(50);
    expect(calculatePaymentRate(100, 100)).toBe(100);
  });

  it('handles partial payments', () => {
    expect(calculatePaymentRate(75, 150)).toBe(50);
    expect(calculatePaymentRate(225, 300)).toBe(75);
  });

  it('returns 0 when no invoices', () => {
    expect(calculatePaymentRate(0, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(calculatePaymentRate(1, 3)).toBe(33); // 33.33...
    expect(calculatePaymentRate(2, 3)).toBe(67); // 66.66...
  });
});

// ============================================================================
// formatPaymentRate Tests
// ============================================================================

describe('formatPaymentRate', () => {
  it('formats rate with percent symbol', () => {
    expect(formatPaymentRate(80)).toBe('80%');
    expect(formatPaymentRate(0)).toBe('0%');
    expect(formatPaymentRate(100)).toBe('100%');
  });
});

// ============================================================================
// formatAvgPaymentDays Tests
// ============================================================================

describe('formatAvgPaymentDays', () => {
  it('returns "No data" for 0 days', () => {
    expect(formatAvgPaymentDays(0)).toBe('No data');
  });

  it('formats days for less than a week', () => {
    expect(formatAvgPaymentDays(3)).toBe('3 days');
    expect(formatAvgPaymentDays(6)).toBe('6 days');
  });

  it('formats weeks for 7-29 days', () => {
    expect(formatAvgPaymentDays(7)).toBe('~1 weeks');
    expect(formatAvgPaymentDays(14)).toBe('~2 weeks');
    expect(formatAvgPaymentDays(21)).toBe('~3 weeks');
  });

  it('formats months for 30+ days', () => {
    expect(formatAvgPaymentDays(30)).toBe('~1 months');
    expect(formatAvgPaymentDays(60)).toBe('~2 months');
    expect(formatAvgPaymentDays(90)).toBe('~3 months');
  });
});

// ============================================================================
// getPaymentReliabilityLabel Tests
// ============================================================================

describe('getPaymentReliabilityLabel', () => {
  it('returns "Excellent" for 90%+', () => {
    expect(getPaymentReliabilityLabel(90)).toBe('Excellent');
    expect(getPaymentReliabilityLabel(100)).toBe('Excellent');
    expect(getPaymentReliabilityLabel(95)).toBe('Excellent');
  });

  it('returns "Good" for 75-89%', () => {
    expect(getPaymentReliabilityLabel(75)).toBe('Good');
    expect(getPaymentReliabilityLabel(89)).toBe('Good');
    expect(getPaymentReliabilityLabel(80)).toBe('Good');
  });

  it('returns "Fair" for 50-74%', () => {
    expect(getPaymentReliabilityLabel(50)).toBe('Fair');
    expect(getPaymentReliabilityLabel(74)).toBe('Fair');
    expect(getPaymentReliabilityLabel(60)).toBe('Fair');
  });

  it('returns "Poor" for below 50%', () => {
    expect(getPaymentReliabilityLabel(49)).toBe('Poor');
    expect(getPaymentReliabilityLabel(0)).toBe('Poor');
    expect(getPaymentReliabilityLabel(25)).toBe('Poor');
  });
});

// ============================================================================
// getPaymentReliabilityColor Tests
// ============================================================================

describe('getPaymentReliabilityColor', () => {
  it('returns green for 90%+', () => {
    expect(getPaymentReliabilityColor(90)).toBe('#10B981');
    expect(getPaymentReliabilityColor(100)).toBe('#10B981');
  });

  it('returns blue for 75-89%', () => {
    expect(getPaymentReliabilityColor(75)).toBe('#3B82F6');
    expect(getPaymentReliabilityColor(89)).toBe('#3B82F6');
  });

  it('returns yellow for 50-74%', () => {
    expect(getPaymentReliabilityColor(50)).toBe('#F59E0B');
    expect(getPaymentReliabilityColor(74)).toBe('#F59E0B');
  });

  it('returns red for below 50%', () => {
    expect(getPaymentReliabilityColor(49)).toBe('#EF4444');
    expect(getPaymentReliabilityColor(0)).toBe('#EF4444');
  });
});
