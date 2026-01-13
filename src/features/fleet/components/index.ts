/**
 * Fleet Management UI Components
 *
 * This module exports all UI components for the Fleet Management feature,
 * including dashboard, driver management, events listing, and modals.
 */

// Dashboard Components
export { FleetDashboard } from './FleetDashboard';
export { FleetMetricsCard } from './FleetMetricsCard';

// Driver Components
export { DriverCard } from './DriverCard';
export { DriverList, type DriverListItem } from './DriverList';
export { DriverDetailModal } from './DriverDetailModal';

// Event Components
export { FleetEventCard } from './FleetEventCard';
export { FleetEventsList, type FleetEventItem } from './FleetEventsList';

// Modal Components
export { InviteDriverModal } from './InviteDriverModal';
export { TeamInvoiceModal } from './TeamInvoice';
export { FleetSettingsModal } from './FleetSettingsModal';

// Shared Components (re-export for convenience)
export {
  StatusBadge,
  RoleBadge,
  MetricItem,
  FilterPill,
  EmptyState,
  ModalHeader,
  SelectableRow,
  Checkbox,
  SkeletonLine,
  SkeletonCard,
  DriverCardSkeleton,
  EventCardSkeleton,
  formatCurrency,
  formatCurrencyPrecise,
  formatDate,
  formatTime,
  formatDuration,
  getStatusConfig,
  getRoleConfig,
} from './shared';

// TeamInvoice step components (for advanced usage)
export {
  TeamInvoiceDriverStep,
  TeamInvoiceEventStep,
  TeamInvoicePreviewStep,
} from './TeamInvoice';
export type { DriverWithEvents, DateRangeOption, DateRange, InvoiceStep } from './TeamInvoice';
