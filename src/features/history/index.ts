/**
 * History Feature Exports
 */

// Convex Hooks (Primary - Real-time data)
export {
  useDetentionHistory,
  useHistorySummary,
  useMonthlySummary,
  getDateRange,
  formatDuration,
} from './hooks/useHistoryConvex';

// Legacy type exports (for backwards compatibility)
export type { DetentionRecord } from './components/HistoryList';

// Services
export {
  formatCurrency,
  formatDate,
  formatTime,
  getStartOfMonth,
  getStartOfWeek,
} from './services/historyService';

// Export Service
export {
  isSharingAvailable,
  generatePdf,
  shareRecordAsPdf,
  generateTextSummary,
  shareRecordAsText,
  exportRecordsAsCsv,
} from './services/exportService';

// Components
export { HistoryCard } from './components/HistoryCard';
export { HistoryList, HistorySummaryCard } from './components/HistoryList';
