/**
 * Fleet Service
 * Handles fleet CRUD operations and dashboard statistics
 */

import { supabase } from '@/shared/lib/supabase';
import type { UUID, DetentionEvent } from '@/shared/types';

// Fleet types
export interface Fleet {
  id: UUID;
  name: string;
  owner_id: UUID;
  company_name: string | null;
  logo_url: string | null;
  billing_email: string | null;
  default_hourly_rate: number;
  default_grace_period_minutes: number;
  settings: FleetSettings | null;
  created_at: string;
  updated_at: string;
}

export interface FleetSettings {
  allowMemberInvites: boolean;
  requireApprovalForEvents: boolean;
  autoConsolidateInvoices: boolean;
  invoiceConsolidationPeriod: 'weekly' | 'biweekly' | 'monthly';
  notifyOnNewEvents: boolean;
  notifyOnInvoiceReady: boolean;
}

export interface FleetCreateInput {
  name: string;
  company_name?: string;
  logo_url?: string;
  billing_email?: string;
  default_hourly_rate?: number;
  default_grace_period_minutes?: number;
  settings?: Partial<FleetSettings>;
}

export interface FleetUpdateInput {
  name?: string;
  company_name?: string;
  logo_url?: string;
  billing_email?: string;
  default_hourly_rate?: number;
  default_grace_period_minutes?: number;
  settings?: Partial<FleetSettings>;
}

export interface FleetSummary {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  totalDetentionMinutes: number;
  totalAmount: number;
  pendingInvoices: number;
  paidInvoices: number;
  averageDetentionMinutes: number;
  eventsByStatus: {
    active: number;
    completed: number;
    invoiced: number;
    paid: number;
  };
}

export interface FleetEventFilters {
  memberId?: string;
  status?: DetentionEvent['status'];
  startDate?: string;
  endDate?: string;
  facilityId?: string;
  eventType?: 'pickup' | 'delivery';
  limit?: number;
  offset?: number;
}

export interface FleetEventWithMember extends DetentionEvent {
  member: {
    id: string;
    user_id: string;
    user_name: string | null;
    user_email: string;
  };
  facility_name: string | null;
}

const DEFAULT_SETTINGS: FleetSettings = {
  allowMemberInvites: false,
  requireApprovalForEvents: false,
  autoConsolidateInvoices: true,
  invoiceConsolidationPeriod: 'biweekly',
  notifyOnNewEvents: true,
  notifyOnInvoiceReady: true,
};

/**
 * Create a new fleet and add owner as admin
 */
export async function createFleet(
  ownerId: string,
  input: FleetCreateInput
): Promise<Fleet> {
  // Create the fleet
  const { data: fleet, error: fleetError } = await supabase
    .from('fleets')
    .insert({
      name: input.name,
      owner_id: ownerId,
      company_name: input.company_name || null,
      logo_url: input.logo_url || null,
      billing_email: input.billing_email || null,
      default_hourly_rate: input.default_hourly_rate ?? 75,
      default_grace_period_minutes: input.default_grace_period_minutes ?? 120,
      settings: { ...DEFAULT_SETTINGS, ...input.settings },
    })
    .select()
    .single();

  if (fleetError) {
    throw new Error(`Failed to create fleet: ${fleetError.message}`);
  }

  // Add the owner as an admin member
  const { error: memberError } = await supabase
    .from('fleet_members')
    .insert({
      fleet_id: fleet.id,
      user_id: ownerId,
      role: 'admin',
      status: 'active',
    });

  if (memberError) {
    // Rollback fleet creation if member creation fails
    await supabase.from('fleets').delete().eq('id', fleet.id);
    throw new Error(`Failed to add owner as admin: ${memberError.message}`);
  }

  return fleet;
}

/**
 * Fetch fleet by ID
 */
export async function fetchFleet(fleetId: string): Promise<Fleet | null> {
  const { data, error } = await supabase
    .from('fleets')
    .select('*')
    .eq('id', fleetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch fleet: ${error.message}`);
  }

  return data;
}

/**
 * Update fleet settings
 */
export async function updateFleet(
  fleetId: string,
  updates: FleetUpdateInput
): Promise<Fleet> {
  // If settings are being updated, merge with existing
  let updateData: Record<string, unknown> = { ...updates };

  if (updates.settings) {
    const { data: existing } = await supabase
      .from('fleets')
      .select('settings')
      .eq('id', fleetId)
      .single();

    updateData.settings = {
      ...DEFAULT_SETTINGS,
      ...(existing?.settings || {}),
      ...updates.settings,
    };
  }

  const { data, error } = await supabase
    .from('fleets')
    .update(updateData)
    .eq('id', fleetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update fleet: ${error.message}`);
  }

  return data;
}

/**
 * Fetch fleet dashboard summary statistics
 */
export async function fetchFleetSummary(fleetId: string): Promise<FleetSummary> {
  // Get member stats
  const { data: members, error: membersError } = await supabase
    .from('fleet_members')
    .select('id, status')
    .eq('fleet_id', fleetId);

  if (membersError) {
    throw new Error(`Failed to fetch members: ${membersError.message}`);
  }

  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m) => m.status === 'active').length || 0;
  const memberIds = members?.map((m) => m.id) || [];

  // Get detention events for all fleet members
  const { data: events, error: eventsError } = await supabase
    .from('detention_events')
    .select('detention_minutes, total_amount, status')
    .in('fleet_member_id', memberIds);

  if (eventsError) {
    throw new Error(`Failed to fetch events: ${eventsError.message}`);
  }

  const eventStats = (events || []).reduce(
    (acc, event) => {
      acc.totalEvents++;
      acc.totalDetentionMinutes += event.detention_minutes;
      acc.totalAmount += event.total_amount;
      acc.eventsByStatus[event.status as keyof typeof acc.eventsByStatus]++;
      return acc;
    },
    {
      totalEvents: 0,
      totalDetentionMinutes: 0,
      totalAmount: 0,
      eventsByStatus: {
        active: 0,
        completed: 0,
        invoiced: 0,
        paid: 0,
      },
    }
  );

  // Get invoice stats
  const { data: invoices, error: invoicesError } = await supabase
    .from('fleet_invoices')
    .select('status')
    .eq('fleet_id', fleetId);

  if (invoicesError) {
    throw new Error(`Failed to fetch invoices: ${invoicesError.message}`);
  }

  const pendingInvoices = invoices?.filter((i) => i.status === 'sent').length || 0;
  const paidInvoices = invoices?.filter((i) => i.status === 'paid').length || 0;

  return {
    totalMembers,
    activeMembers,
    ...eventStats,
    pendingInvoices,
    paidInvoices,
    averageDetentionMinutes:
      eventStats.totalEvents > 0
        ? Math.round(eventStats.totalDetentionMinutes / eventStats.totalEvents)
        : 0,
  };
}

/**
 * Fetch all driver events for fleet admin view
 */
export async function fetchFleetEvents(
  fleetId: string,
  filters: FleetEventFilters = {}
): Promise<FleetEventWithMember[]> {
  // First get fleet members
  let membersQuery = supabase
    .from('fleet_members')
    .select('id, user_id, users (name, email)')
    .eq('fleet_id', fleetId);

  if (filters.memberId) {
    membersQuery = membersQuery.eq('id', filters.memberId);
  }

  const { data: members, error: membersError } = await membersQuery;

  if (membersError) {
    throw new Error(`Failed to fetch members: ${membersError.message}`);
  }

  if (!members || members.length === 0) {
    return [];
  }

  const memberIds = members.map((m) => m.id);
  const memberMap = new Map(
    members.map((m) => [
      m.id,
      {
        id: m.id,
        user_id: m.user_id,
        user_name: (m.users as any)?.name || null,
        user_email: (m.users as any)?.email || '',
      },
    ])
  );

  // Build events query
  let eventsQuery = supabase
    .from('detention_events')
    .select(`
      *,
      facilities (name)
    `)
    .in('fleet_member_id', memberIds)
    .order('arrival_time', { ascending: false });

  if (filters.status) {
    eventsQuery = eventsQuery.eq('status', filters.status);
  }

  if (filters.startDate) {
    eventsQuery = eventsQuery.gte('arrival_time', filters.startDate);
  }

  if (filters.endDate) {
    eventsQuery = eventsQuery.lte('arrival_time', filters.endDate);
  }

  if (filters.facilityId) {
    eventsQuery = eventsQuery.eq('facility_id', filters.facilityId);
  }

  if (filters.eventType) {
    eventsQuery = eventsQuery.eq('event_type', filters.eventType);
  }

  if (filters.limit) {
    eventsQuery = eventsQuery.limit(filters.limit);
  }

  if (filters.offset) {
    eventsQuery = eventsQuery.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data: events, error: eventsError } = await eventsQuery;

  if (eventsError) {
    throw new Error(`Failed to fetch events: ${eventsError.message}`);
  }

  return (events || []).map((event) => ({
    ...event,
    member: memberMap.get(event.fleet_member_id)!,
    facility_name: (event.facilities as any)?.name || null,
  }));
}

/**
 * Get fleets for a user (as owner or member)
 */
export async function fetchUserFleets(userId: string): Promise<Fleet[]> {
  const { data: memberships, error: memberError } = await supabase
    .from('fleet_members')
    .select('fleet_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (memberError) {
    throw new Error(`Failed to fetch memberships: ${memberError.message}`);
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const fleetIds = memberships.map((m) => m.fleet_id);

  const { data: fleets, error: fleetsError } = await supabase
    .from('fleets')
    .select('*')
    .in('id', fleetIds)
    .order('name');

  if (fleetsError) {
    throw new Error(`Failed to fetch fleets: ${fleetsError.message}`);
  }

  return fleets || [];
}

/**
 * Delete a fleet (owner only)
 */
export async function deleteFleet(fleetId: string, ownerId: string): Promise<void> {
  // Verify ownership
  const { data: fleet, error: fetchError } = await supabase
    .from('fleets')
    .select('owner_id')
    .eq('id', fleetId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch fleet: ${fetchError.message}`);
  }

  if (fleet.owner_id !== ownerId) {
    throw new Error('Only the fleet owner can delete the fleet');
  }

  // Delete fleet (cascade will handle members, invitations, etc.)
  const { error: deleteError } = await supabase
    .from('fleets')
    .delete()
    .eq('id', fleetId);

  if (deleteError) {
    throw new Error(`Failed to delete fleet: ${deleteError.message}`);
  }
}
