/**
 * Recovery Service
 * Utility functions for payment recovery dashboard
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.invoices.getAgingSummary, { userId }) - Get aging buckets
 */

export interface AgingBucket {
  count: number;
  amount: number;
}

export interface AgingSummary {
  current: AgingBucket;      // 0-30 days
  thirtyDays: AgingBucket;   // 31-60 days
  sixtyDays: AgingBucket;    // 61-90 days
  ninetyPlus: AgingBucket;   // 90+ days
  totalUnpaid: number;
  totalPaid: number;
  totalInvoiced: number;
  unpaidCount: number;
  paidCount: number;
}

/**
 * Calculate collection priority score
 */
export function calculatePriorityScore(
  amount: number,
  daysOutstanding: number
): number {
  // Higher amount and older invoices get higher priority
  const amountFactor = Math.min(amount / 1000, 10); // Cap at 10 for $10k+
  const ageFactor = Math.min(daysOutstanding / 30, 4); // Cap at 4 for 120+ days
  return amountFactor * ageFactor;
}

/**
 * Get priority label based on score
 */
export function getPriorityLabel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

/**
 * Get priority color
 */
export function getPriorityColor(score: number): string {
  if (score >= 20) return '#DC2626'; // red
  if (score >= 10) return '#F59E0B'; // orange
  if (score >= 5) return '#3B82F6'; // blue
  return '#6B7280'; // gray
}

/**
 * Format aging bucket label
 */
export function formatAgingBucketLabel(bucket: string): string {
  switch (bucket) {
    case 'current':
      return '0-30 days';
    case 'thirtyDays':
      return '31-60 days';
    case 'sixtyDays':
      return '61-90 days';
    case 'ninetyPlus':
      return '90+ days';
    default:
      return bucket;
  }
}

/**
 * Calculate days outstanding from sent date
 */
export function calculateDaysOutstanding(sentAt: number): number {
  const now = Date.now();
  const diff = now - sentAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get suggested follow-up action
 */
export function getSuggestedAction(daysOutstanding: number): string {
  if (daysOutstanding <= 30) return 'Monitor - within terms';
  if (daysOutstanding <= 45) return 'Send reminder email';
  if (daysOutstanding <= 60) return 'Make phone call';
  if (daysOutstanding <= 90) return 'Send final notice';
  return 'Consider collection agency';
}
