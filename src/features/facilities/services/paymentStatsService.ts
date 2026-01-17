/**
 * Payment Stats Service
 * Utility functions for facility payment statistics
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex
 */

export interface PaymentStat {
  facilityId: string;
  facilityName: string;
  totalInvoiced: number;
  totalPaid: number;
  avgPaymentDays: number;
  invoiceCount: number;
  paidCount: number;
}

/**
 * Calculate payment rate percentage
 */
export function calculatePaymentRate(paid: number, invoiced: number): number {
  if (invoiced === 0) return 0;
  return Math.round((paid / invoiced) * 100);
}

/**
 * Format payment rate for display
 */
export function formatPaymentRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Format average payment days
 */
export function formatAvgPaymentDays(days: number): string {
  if (days === 0) return 'No data';
  if (days < 7) return `${Math.round(days)} days`;
  if (days < 30) return `~${Math.round(days / 7)} weeks`;
  return `~${Math.round(days / 30)} months`;
}

/**
 * Get payment reliability label
 */
export function getPaymentReliabilityLabel(rate: number): string {
  if (rate >= 90) return 'Excellent';
  if (rate >= 75) return 'Good';
  if (rate >= 50) return 'Fair';
  return 'Poor';
}

/**
 * Get payment reliability color
 */
export function getPaymentReliabilityColor(rate: number): string {
  if (rate >= 90) return '#10B981'; // green
  if (rate >= 75) return '#3B82F6'; // blue
  if (rate >= 50) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}
