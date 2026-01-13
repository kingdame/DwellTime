/**
 * Recovery Feature Module
 * Exports for invoice tracking, aging, and recovery dashboard
 */

// Services
export {
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
} from './services/recoveryService';

// Hooks
export {
  useRecoveryStats,
  useROICalculation,
  useRecoverySummary,
} from './hooks/useRecoveryStats';

export {
  useAgingInvoices,
  useAgingBuckets,
  useMarkPaid,
  useMarkPartialPaid,
  useUpdateTracking,
  useRecordReminder,
  useRemindersDue,
  useAgingInvoicesByBucket,
} from './hooks/useInvoiceAging';

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
  AgingBucket,
} from '@/shared/types/recovery';

export {
  AGING_THRESHOLDS,
  AGING_COLORS,
  AGING_LABELS,
} from '@/shared/types/recovery';
