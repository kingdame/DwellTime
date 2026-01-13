/**
 * TeamInvoice Types
 */

import type { DetentionEvent } from '@/shared/types';

export interface DriverWithEvents {
  id: string;
  name: string | null;
  email: string | null;
  events: DetentionEvent[];
  totalAmount: number;
  eventCount: number;
}

export type DateRangeOption = 'week' | 'biweekly' | 'month' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export type InvoiceStep = 'drivers' | 'events' | 'preview';
