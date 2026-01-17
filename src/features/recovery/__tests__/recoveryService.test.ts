/**
 * Recovery Service Tests
 * Tests pure utility functions for payment recovery
 * 
 * NOTE: Database operations now use Convex hooks directly.
 * These tests cover the utility/helper functions only.
 */

import {
  calculatePriorityScore,
  getPriorityLabel,
  getPriorityColor,
  formatAgingBucketLabel,
  calculateDaysOutstanding,
  getSuggestedAction,
} from '../services/recoveryService';

// ============================================================================
// calculatePriorityScore Tests
// ============================================================================

describe('calculatePriorityScore', () => {
  it('calculates higher score for higher amounts', () => {
    const lowAmount = calculatePriorityScore(100, 30);
    const highAmount = calculatePriorityScore(1000, 30);
    expect(highAmount).toBeGreaterThan(lowAmount);
  });

  it('calculates higher score for older invoices', () => {
    const recent = calculatePriorityScore(500, 30);
    const old = calculatePriorityScore(500, 90);
    expect(old).toBeGreaterThan(recent);
  });

  it('caps amount factor at 10 for $10k+', () => {
    const tenK = calculatePriorityScore(10000, 30);
    const twentyK = calculatePriorityScore(20000, 30);
    expect(tenK).toBe(twentyK); // Both capped
  });

  it('caps age factor at 4 for 120+ days', () => {
    const oneHundredTwenty = calculatePriorityScore(1000, 120);
    const twoHundred = calculatePriorityScore(1000, 200);
    expect(oneHundredTwenty).toBe(twoHundred); // Both capped
  });
});

// ============================================================================
// getPriorityLabel Tests
// ============================================================================

describe('getPriorityLabel', () => {
  it('returns "Critical" for score >= 20', () => {
    expect(getPriorityLabel(20)).toBe('Critical');
    expect(getPriorityLabel(40)).toBe('Critical');
  });

  it('returns "High" for score 10-19', () => {
    expect(getPriorityLabel(10)).toBe('High');
    expect(getPriorityLabel(19)).toBe('High');
  });

  it('returns "Medium" for score 5-9', () => {
    expect(getPriorityLabel(5)).toBe('Medium');
    expect(getPriorityLabel(9)).toBe('Medium');
  });

  it('returns "Low" for score < 5', () => {
    expect(getPriorityLabel(4)).toBe('Low');
    expect(getPriorityLabel(0)).toBe('Low');
  });
});

// ============================================================================
// getPriorityColor Tests
// ============================================================================

describe('getPriorityColor', () => {
  it('returns red for critical priority', () => {
    expect(getPriorityColor(20)).toBe('#DC2626');
  });

  it('returns orange for high priority', () => {
    expect(getPriorityColor(15)).toBe('#F59E0B');
  });

  it('returns blue for medium priority', () => {
    expect(getPriorityColor(7)).toBe('#3B82F6');
  });

  it('returns gray for low priority', () => {
    expect(getPriorityColor(2)).toBe('#6B7280');
  });
});

// ============================================================================
// formatAgingBucketLabel Tests
// ============================================================================

describe('formatAgingBucketLabel', () => {
  it('formats current bucket', () => {
    expect(formatAgingBucketLabel('current')).toBe('0-30 days');
  });

  it('formats thirtyDays bucket', () => {
    expect(formatAgingBucketLabel('thirtyDays')).toBe('31-60 days');
  });

  it('formats sixtyDays bucket', () => {
    expect(formatAgingBucketLabel('sixtyDays')).toBe('61-90 days');
  });

  it('formats ninetyPlus bucket', () => {
    expect(formatAgingBucketLabel('ninetyPlus')).toBe('90+ days');
  });

  it('returns input for unknown bucket', () => {
    expect(formatAgingBucketLabel('custom')).toBe('custom');
  });
});

// ============================================================================
// calculateDaysOutstanding Tests
// ============================================================================

describe('calculateDaysOutstanding', () => {
  it('calculates correct days from timestamp', () => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    expect(calculateDaysOutstanding(thirtyDaysAgo)).toBe(30);
  });

  it('returns 0 for current timestamp', () => {
    expect(calculateDaysOutstanding(Date.now())).toBe(0);
  });

  it('handles various time periods', () => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    expect(calculateDaysOutstanding(sevenDaysAgo)).toBe(7);
    expect(calculateDaysOutstanding(ninetyDaysAgo)).toBe(90);
  });
});

// ============================================================================
// getSuggestedAction Tests
// ============================================================================

describe('getSuggestedAction', () => {
  it('suggests monitoring for 0-30 days', () => {
    expect(getSuggestedAction(15)).toBe('Monitor - within terms');
    expect(getSuggestedAction(30)).toBe('Monitor - within terms');
  });

  it('suggests email reminder for 31-45 days', () => {
    expect(getSuggestedAction(35)).toBe('Send reminder email');
    expect(getSuggestedAction(45)).toBe('Send reminder email');
  });

  it('suggests phone call for 46-60 days', () => {
    expect(getSuggestedAction(50)).toBe('Make phone call');
    expect(getSuggestedAction(60)).toBe('Make phone call');
  });

  it('suggests final notice for 61-90 days', () => {
    expect(getSuggestedAction(75)).toBe('Send final notice');
    expect(getSuggestedAction(90)).toBe('Send final notice');
  });

  it('suggests collection agency for 90+ days', () => {
    expect(getSuggestedAction(91)).toBe('Consider collection agency');
    expect(getSuggestedAction(120)).toBe('Consider collection agency');
  });
});
