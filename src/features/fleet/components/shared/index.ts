/**
 * Shared Fleet Components
 * Re-exports all shared UI components and utilities
 */

// Badge components
export { StatusBadge, getStatusConfig } from './StatusBadge';
export type { StatusType } from './StatusBadge';
export { RoleBadge, getRoleConfig } from './RoleBadge';

// Display components
export { MetricItem } from './MetricItem';
export { EmptyState } from './EmptyState';
export { FilterPill } from './FilterPill';

// Layout components
export { ModalHeader } from './ModalHeader';
export { SelectableRow, Checkbox } from './SelectableRow';

// Loading components
export {
  SkeletonLine,
  SkeletonCard,
  DriverCardSkeleton,
  EventCardSkeleton,
} from './SkeletonLoader';

// Formatting utilities
export {
  formatCurrency,
  formatCurrencyPrecise,
  formatDate,
  formatTime,
  formatDuration,
} from './formatters';
