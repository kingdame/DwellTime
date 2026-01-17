/**
 * Recovery Feature Module
 * Exports for invoice tracking, aging, and recovery dashboard
 *
 * NOTE: Recovery data operations now use Convex hooks from @/shared/hooks/convex:
 * - useRecoveryStats(userId) - Get recovery statistics
 * - useInvoicesForRecovery(userId) - Get invoices for recovery tracking
 */

// Services - Utility functions
export {
  type AgingBucket,
  type AgingSummary,
  calculatePriorityScore,
  getPriorityLabel,
  getPriorityColor,
  formatAgingBucketLabel,
  calculateDaysOutstanding,
  getSuggestedAction,
} from './services/recoveryService';

// Convex Hooks (re-export for convenience)
export {
  useRecoveryStats,
  useInvoicesForRecovery,
  useMarkSent,
  useMarkPaid,
  useReportPaymentOutcome,
  calculateROI,
} from './hooks/useRecoveryConvex';

// Components
export { RecoveryDashboard } from './components/RecoveryDashboard';
export { InvoiceAgingList } from './components/InvoiceAgingList';
export { ROICard } from './components/ROICard';
export { StatCard } from './components/StatCard';
export { AgingBucketCard } from './components/AgingBucketCard';

// Types (re-export from shared)
export type {
  InvoiceTracking,
  InvoiceTrackingInput,
  InvoiceTrackingUpdate,
  RecoveryStats,
  AgingInvoice,
  AgingBucketSummary,
  ROICalculation,
  PaymentStatus,
  AgingBucket as AgingBucketType,
} from '@/shared/types/recovery';

export {
  AGING_THRESHOLDS,
  AGING_COLORS,
  AGING_LABELS,
} from '@/shared/types/recovery';
