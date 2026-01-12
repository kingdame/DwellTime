/**
 * History Service
 * Fetches and manages detention history from Supabase
 */

import { supabase } from '@/shared/lib/supabase';

export interface DetentionRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string | null;
  eventType: 'pickup' | 'delivery';
  loadReference: string | null;
  arrivalTime: string;
  departureTime: string | null;
  gracePeriodMinutes: number;
  hourlyRate: number;
  totalElapsedMinutes: number;
  detentionMinutes: number;
  detentionAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  verificationCode: string;
  photoCount: number;
  createdAt: string;
}

export interface HistorySummary {
  totalEarnings: number;
  totalSessions: number;
  totalDetentionMinutes: number;
  averageWaitMinutes: number;
}

export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  facilityId?: string;
  eventType?: 'pickup' | 'delivery';
  status?: 'active' | 'completed' | 'cancelled';
}

/**
 * Fetch detention history for the current user
 */
export async function fetchDetentionHistory(
  filters?: HistoryFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ records: DetentionRecord[]; total: number }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { records: [], total: 0 };
    }

    // Build query - using any to bypass type issues with generated types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('detention_events')
      .select(`
        id,
        facility_id,
        event_type,
        load_reference,
        arrival_time,
        departure_time,
        grace_period_minutes,
        hourly_rate,
        total_elapsed_minutes,
        detention_minutes,
        detention_amount,
        status,
        notes,
        verification_code,
        created_at,
        facilities (
          name,
          address
        ),
        photos (count)
      `, { count: 'exact' })
      .eq('user_id', session.session.user.id)
      .order('arrival_time', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('arrival_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('arrival_time', filters.endDate);
    }
    if (filters?.facilityId) {
      query = query.eq('facility_id', filters.facilityId);
    }
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch detention history:', error);
      return { records: [], total: 0 };
    }

    // Transform data
    const records: DetentionRecord[] = (data || []).map((record: {
      id: string;
      facility_id: string;
      event_type: 'pickup' | 'delivery';
      load_reference: string | null;
      arrival_time: string;
      departure_time: string | null;
      grace_period_minutes: number;
      hourly_rate: number;
      total_elapsed_minutes: number;
      detention_minutes: number;
      detention_amount: number;
      status: 'active' | 'completed' | 'cancelled';
      notes: string | null;
      verification_code: string;
      created_at: string;
      facilities: { name: string; address: string | null } | null;
      photos: { count: number }[] | null;
    }) => ({
      id: record.id,
      facilityId: record.facility_id,
      facilityName: record.facilities?.name || 'Unknown Facility',
      facilityAddress: record.facilities?.address || null,
      eventType: record.event_type,
      loadReference: record.load_reference,
      arrivalTime: record.arrival_time,
      departureTime: record.departure_time,
      gracePeriodMinutes: record.grace_period_minutes,
      hourlyRate: record.hourly_rate,
      totalElapsedMinutes: record.total_elapsed_minutes || 0,
      detentionMinutes: record.detention_minutes || 0,
      detentionAmount: record.detention_amount || 0,
      status: record.status,
      notes: record.notes,
      verificationCode: record.verification_code,
      photoCount: record.photos?.[0]?.count || 0,
      createdAt: record.created_at,
    }));

    return { records, total: count || 0 };
  } catch (error) {
    console.error('Error fetching detention history:', error);
    return { records: [], total: 0 };
  }
}

/**
 * Fetch a single detention record with full details
 */
export async function fetchDetentionDetail(id: string): Promise<DetentionRecord | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('detention_events')
      .select(`
        id,
        facility_id,
        event_type,
        load_reference,
        arrival_time,
        departure_time,
        grace_period_minutes,
        hourly_rate,
        total_elapsed_minutes,
        detention_minutes,
        detention_amount,
        status,
        notes,
        verification_code,
        created_at,
        facilities (
          name,
          address
        ),
        photos (count)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch detention detail:', error);
      return null;
    }

    return {
      id: data.id,
      facilityId: data.facility_id,
      facilityName: data.facilities?.name || 'Unknown Facility',
      facilityAddress: data.facilities?.address || null,
      eventType: data.event_type,
      loadReference: data.load_reference,
      arrivalTime: data.arrival_time,
      departureTime: data.departure_time,
      gracePeriodMinutes: data.grace_period_minutes,
      hourlyRate: data.hourly_rate,
      totalElapsedMinutes: data.total_elapsed_minutes || 0,
      detentionMinutes: data.detention_minutes || 0,
      detentionAmount: data.detention_amount || 0,
      status: data.status,
      notes: data.notes,
      verificationCode: data.verification_code,
      photoCount: data.photos?.[0]?.count || 0,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching detention detail:', error);
    return null;
  }
}

/**
 * Fetch history summary (earnings, sessions, etc.)
 */
export async function fetchHistorySummary(
  startDate?: string,
  endDate?: string
): Promise<HistorySummary> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return {
        totalEarnings: 0,
        totalSessions: 0,
        totalDetentionMinutes: 0,
        averageWaitMinutes: 0,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('detention_events')
      .select('detention_amount, detention_minutes, total_elapsed_minutes')
      .eq('user_id', session.session.user.id)
      .eq('status', 'completed');

    if (startDate) {
      query = query.gte('arrival_time', startDate);
    }
    if (endDate) {
      query = query.lte('arrival_time', endDate);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to fetch history summary:', error);
      return {
        totalEarnings: 0,
        totalSessions: 0,
        totalDetentionMinutes: 0,
        averageWaitMinutes: 0,
      };
    }

    const totalEarnings = data.reduce((sum: number, r: { detention_amount: number }) =>
      sum + (r.detention_amount || 0), 0);
    const totalDetentionMinutes = data.reduce((sum: number, r: { detention_minutes: number }) =>
      sum + (r.detention_minutes || 0), 0);
    const totalElapsedMinutes = data.reduce((sum: number, r: { total_elapsed_minutes: number }) =>
      sum + (r.total_elapsed_minutes || 0), 0);

    return {
      totalEarnings,
      totalSessions: data.length,
      totalDetentionMinutes,
      averageWaitMinutes: data.length > 0 ? Math.round(totalElapsedMinutes / data.length) : 0,
    };
  } catch (error) {
    console.error('Error fetching history summary:', error);
    return {
      totalEarnings: 0,
      totalSessions: 0,
      totalDetentionMinutes: 0,
      averageWaitMinutes: 0,
    };
  }
}

/**
 * Get start of current month
 */
export function getStartOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Get start of current week
 */
export function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
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
 * Format date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
