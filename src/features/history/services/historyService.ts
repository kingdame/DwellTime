/**
 * History Service
 * Formatting and utility functions for detention history
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex:
 * - useQuery(api.detentionEvents.list, { userId }) - Get history
 * - useQuery(api.history.getSummary, { userId }) - Get summary stats
 */

export interface DetentionRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string | null;
  eventType: 'pickup' | 'delivery';
  loadReference: string | null;
  arrivalTime: number; // Unix timestamp
  departureTime: number | null;
  gracePeriodMinutes: number;
  hourlyRate: number;
  totalElapsedMinutes: number;
  detentionMinutes: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'invoiced' | 'paid';
  notes: string | null;
  verificationCode?: string;
  photoCount?: number;
}

export interface HistorySummary {
  totalEarnings: number;
  totalSessions: number;
  totalDetentionMinutes: number;
  averageWaitMinutes: number;
}

export interface HistoryFilters {
  startDate?: number; // Unix timestamp
  endDate?: number;
  facilityId?: string;
  eventType?: 'pickup' | 'delivery';
  status?: 'active' | 'completed' | 'invoiced' | 'paid';
}

/**
 * Calculate history summary from an array of detention records
 * Use this with data from Convex queries
 */
export function calculateHistorySummary(records: DetentionRecord[]): HistorySummary {
  const completedRecords = records.filter(r => r.status === 'completed' || r.status === 'invoiced' || r.status === 'paid');
  
  const totalEarnings = completedRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalDetentionMinutes = completedRecords.reduce((sum, r) => sum + (r.detentionMinutes || 0), 0);
  const totalElapsedMinutes = completedRecords.reduce((sum, r) => sum + (r.totalElapsedMinutes || 0), 0);

  return {
    totalEarnings,
    totalSessions: completedRecords.length,
    totalDetentionMinutes,
    averageWaitMinutes: completedRecords.length > 0 ? Math.round(totalElapsedMinutes / completedRecords.length) : 0,
  };
}

/**
 * Filter records client-side
 * Use when you have all records and need to apply filters
 */
export function filterRecords(records: DetentionRecord[], filters: HistoryFilters): DetentionRecord[] {
  return records.filter(record => {
    if (filters.startDate && record.arrivalTime < filters.startDate) return false;
    if (filters.endDate && record.arrivalTime > filters.endDate) return false;
    if (filters.facilityId && record.facilityId !== filters.facilityId) return false;
    if (filters.eventType && record.eventType !== filters.eventType) return false;
    if (filters.status && record.status !== filters.status) return false;
    return true;
  });
}

/**
 * Get start of current month as Unix timestamp
 */
export function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * Get start of current week as Unix timestamp
 */
export function getStartOfWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.getFullYear(), now.getMonth(), diff).getTime();
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format date for display from Unix timestamp
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time for display from Unix timestamp
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return formatDate(timestamp);
}
