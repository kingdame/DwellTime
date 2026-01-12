/**
 * History Feature Exports
 */

// Hooks
export {
  useDetentionHistory,
  useDetentionDetail,
  useMonthSummary,
  useAllTimeSummary,
  type DetentionRecord,
  type HistorySummary,
  type HistoryFilters,
} from './hooks/useHistory';

// Services
export {
  fetchDetentionHistory,
  fetchDetentionDetail,
  fetchHistorySummary,
  formatCurrency,
  formatDuration,
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
