/**
 * Member Service
 * Handles fleet member management
 */

import { supabase } from '@/shared/lib/supabase';
import type { UUID } from '@/shared/types';

// Member types
export type MemberRole = 'admin' | 'manager' | 'driver';
export type MemberStatus = 'active' | 'suspended' | 'removed';

export interface FleetMember {
  id: UUID;
  fleet_id: UUID;
  user_id: UUID;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface FleetMemberWithUser extends FleetMember {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    company_name: string | null;
  };
  stats?: {
    totalEvents: number;
    totalDetentionMinutes: number;
    totalAmount: number;
  };
}

export interface AddMemberInput {
  userId: string;
  role?: MemberRole;
}

/**
 * Fetch all members of a fleet
 */
export async function fetchFleetMembers(
  fleetId: string,
  includeStats: boolean = false
): Promise<FleetMemberWithUser[]> {
  const { data: members, error } = await supabase
    .from('fleet_members')
    .select(`
      *,
      users (id, name, email, phone, company_name)
    `)
    .eq('fleet_id', fleetId)
    .neq('status', 'removed')
    .order('role')
    .order('joined_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch fleet members: ${error.message}`);
  }

  const membersWithUser: FleetMemberWithUser[] = (members || []).map((m) => ({
    ...m,
    user: m.users as unknown as FleetMemberWithUser['user'],
  }));

  if (!includeStats) {
    return membersWithUser;
  }

  // Fetch stats for each member
  const memberIds = membersWithUser.map((m) => m.id);

  const { data: events, error: eventsError } = await supabase
    .from('detention_events')
    .select('fleet_member_id, detention_minutes, total_amount')
    .in('fleet_member_id', memberIds);

  if (eventsError) {
    console.error('Failed to fetch member stats:', eventsError);
    return membersWithUser;
  }

  // Aggregate stats by member
  const statsMap = new Map<string, { totalEvents: number; totalDetentionMinutes: number; totalAmount: number }>();

  for (const event of events || []) {
    const existing = statsMap.get(event.fleet_member_id) || {
      totalEvents: 0,
      totalDetentionMinutes: 0,
      totalAmount: 0,
    };
    statsMap.set(event.fleet_member_id, {
      totalEvents: existing.totalEvents + 1,
      totalDetentionMinutes: existing.totalDetentionMinutes + event.detention_minutes,
      totalAmount: existing.totalAmount + event.total_amount,
    });
  }

  return membersWithUser.map((m) => ({
    ...m,
    stats: statsMap.get(m.id) || {
      totalEvents: 0,
      totalDetentionMinutes: 0,
      totalAmount: 0,
    },
  }));
}

/**
 * Get a single fleet member
 */
export async function fetchFleetMember(memberId: string): Promise<FleetMemberWithUser | null> {
  const { data, error } = await supabase
    .from('fleet_members')
    .select(`
      *,
      users (id, name, email, phone, company_name)
    `)
    .eq('id', memberId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch fleet member: ${error.message}`);
  }

  return {
    ...data,
    user: data.users as unknown as FleetMemberWithUser['user'],
  };
}

/**
 * Add an existing user to a fleet
 */
export async function addFleetMember(
  fleetId: string,
  userId: string,
  role: MemberRole = 'driver'
): Promise<FleetMember> {
  // Check if user is already a member
  const { data: existing } = await supabase
    .from('fleet_members')
    .select('id, status')
    .eq('fleet_id', fleetId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('User is already a member of this fleet');
    }

    // Reactivate removed/suspended member
    const { data: reactivated, error: reactivateError } = await supabase
      .from('fleet_members')
      .update({
        status: 'active',
        role,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (reactivateError) {
      throw new Error(`Failed to reactivate member: ${reactivateError.message}`);
    }

    return reactivated;
  }

  // Add new member
  const { data, error } = await supabase
    .from('fleet_members')
    .insert({
      fleet_id: fleetId,
      user_id: userId,
      role,
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add fleet member: ${error.message}`);
  }

  return data;
}

/**
 * Update member status (activate/suspend)
 */
export async function updateMemberStatus(
  memberId: string,
  status: 'active' | 'suspended'
): Promise<FleetMember> {
  // Don't allow removing via this method
  if (status !== 'active' && status !== 'suspended') {
    throw new Error('Invalid status. Use removeFleetMember to remove members.');
  }

  const { data, error } = await supabase
    .from('fleet_members')
    .update({ status })
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update member status: ${error.message}`);
  }

  return data;
}

/**
 * Update member role
 */
export async function updateMemberRole(
  memberId: string,
  role: MemberRole
): Promise<FleetMember> {
  const { data, error } = await supabase
    .from('fleet_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }

  return data;
}

/**
 * Remove member from fleet
 */
export async function removeFleetMember(memberId: string): Promise<void> {
  // Get member details first
  const { data: member, error: fetchError } = await supabase
    .from('fleet_members')
    .select('fleet_id, role')
    .eq('id', memberId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch member: ${fetchError.message}`);
  }

  // Prevent removing the last admin
  if (member.role === 'admin') {
    const { data: admins } = await supabase
      .from('fleet_members')
      .select('id')
      .eq('fleet_id', member.fleet_id)
      .eq('role', 'admin')
      .eq('status', 'active');

    if (admins && admins.length <= 1) {
      throw new Error('Cannot remove the last admin. Transfer ownership first.');
    }
  }

  // Soft delete - mark as removed
  const { error } = await supabase
    .from('fleet_members')
    .update({ status: 'removed' })
    .eq('id', memberId);

  if (error) {
    throw new Error(`Failed to remove fleet member: ${error.message}`);
  }
}

/**
 * Check if a user has a specific role in a fleet
 */
export async function checkMemberRole(
  fleetId: string,
  userId: string,
  requiredRoles: MemberRole[]
): Promise<boolean> {
  const { data, error } = await supabase
    .from('fleet_members')
    .select('role')
    .eq('fleet_id', fleetId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return false;
  }

  return requiredRoles.includes(data.role as MemberRole);
}

/**
 * Check if user is admin or manager of a fleet
 */
export async function isFleetAdmin(fleetId: string, userId: string): Promise<boolean> {
  return checkMemberRole(fleetId, userId, ['admin', 'manager']);
}

/**
 * Get member's fleet membership
 */
export async function getUserMembership(
  fleetId: string,
  userId: string
): Promise<FleetMember | null> {
  const { data, error } = await supabase
    .from('fleet_members')
    .select('*')
    .eq('fleet_id', fleetId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch membership: ${error.message}`);
  }

  return data;
}

/**
 * Transfer fleet ownership to another admin
 */
export async function transferOwnership(
  fleetId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  // Verify current owner
  const { data: fleet, error: fleetError } = await supabase
    .from('fleets')
    .select('owner_id')
    .eq('id', fleetId)
    .single();

  if (fleetError) {
    throw new Error(`Failed to fetch fleet: ${fleetError.message}`);
  }

  if (fleet.owner_id !== currentOwnerId) {
    throw new Error('Only the current owner can transfer ownership');
  }

  // Verify new owner is an active admin
  const isAdmin = await checkMemberRole(fleetId, newOwnerId, ['admin']);
  if (!isAdmin) {
    throw new Error('New owner must be an active admin of the fleet');
  }

  // Update fleet owner
  const { error: updateError } = await supabase
    .from('fleets')
    .update({ owner_id: newOwnerId })
    .eq('id', fleetId);

  if (updateError) {
    throw new Error(`Failed to transfer ownership: ${updateError.message}`);
  }
}
