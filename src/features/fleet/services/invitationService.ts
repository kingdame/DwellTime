/**
 * Invitation Service
 * Handles fleet invitation management
 */

import { supabase } from '@/shared/lib/supabase';
import type { UUID } from '@/shared/types';
import type { MemberRole } from './memberService';
import { addFleetMember } from './memberService';

// Invitation types
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled';

export interface FleetInvitation {
  id: UUID;
  fleet_id: UUID;
  email: string;
  role: MemberRole;
  invitation_code: string;
  status: InvitationStatus;
  invited_by: UUID;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: UUID | null;
  created_at: string;
}

export interface FleetInvitationWithDetails extends FleetInvitation {
  fleet: {
    id: string;
    name: string;
    company_name: string | null;
  };
  inviter: {
    name: string | null;
    email: string;
  };
}

export interface CreateInvitationInput {
  email: string;
  role?: MemberRole;
  expiresInDays?: number;
}

// Characters for generating invitation codes (alphanumeric, excluding ambiguous chars)
const CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

// Default invitation expiration in days
const DEFAULT_EXPIRATION_DAYS = 7;

/**
 * Generate a random 8-character alphanumeric invitation code
 */
export function generateInvitationCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARACTERS.length);
    code += CODE_CHARACTERS[randomIndex];
  }
  return code;
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  fleetId: string,
  invitedBy: string,
  input: CreateInvitationInput
): Promise<FleetInvitation> {
  const email = input.email.toLowerCase().trim();
  const role = input.role || 'driver';
  const expirationDays = input.expiresInDays || DEFAULT_EXPIRATION_DAYS;

  // Check if there's already a pending invitation for this email
  const { data: existing } = await supabase
    .from('fleet_invitations')
    .select('id, status')
    .eq('fleet_id', fleetId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existing) {
    throw new Error('A pending invitation already exists for this email');
  }

  // Check if user is already a member
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('fleet_members')
      .select('id, status')
      .eq('fleet_id', fleetId)
      .eq('user_id', existingUser.id)
      .single();

    if (existingMember?.status === 'active') {
      throw new Error('This user is already a member of the fleet');
    }
  }

  // Generate unique invitation code
  let invitationCode = generateInvitationCode();
  let codeUnique = false;
  let attempts = 0;

  while (!codeUnique && attempts < 10) {
    const { data: codeExists } = await supabase
      .from('fleet_invitations')
      .select('id')
      .eq('invitation_code', invitationCode)
      .eq('status', 'pending')
      .single();

    if (!codeExists) {
      codeUnique = true;
    } else {
      invitationCode = generateInvitationCode();
      attempts++;
    }
  }

  if (!codeUnique) {
    throw new Error('Failed to generate unique invitation code');
  }

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  // Create invitation
  const { data, error } = await supabase
    .from('fleet_invitations')
    .insert({
      fleet_id: fleetId,
      email,
      role,
      invitation_code: invitationCode,
      status: 'pending',
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  return data;
}

/**
 * Fetch pending invitations for a fleet
 */
export async function fetchPendingInvitations(
  fleetId: string
): Promise<FleetInvitationWithDetails[]> {
  const { data, error } = await supabase
    .from('fleet_invitations')
    .select(`
      *,
      fleets (id, name, company_name),
      users!invited_by (name, email)
    `)
    .eq('fleet_id', fleetId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invitations: ${error.message}`);
  }

  return (data || []).map((inv) => ({
    ...inv,
    fleet: inv.fleets as unknown as FleetInvitationWithDetails['fleet'],
    inviter: inv.users as unknown as FleetInvitationWithDetails['inviter'],
  }));
}

/**
 * Get invitation by code
 */
export async function fetchInvitationByCode(
  code: string
): Promise<FleetInvitationWithDetails | null> {
  const { data, error } = await supabase
    .from('fleet_invitations')
    .select(`
      *,
      fleets (id, name, company_name),
      users!invited_by (name, email)
    `)
    .eq('invitation_code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch invitation: ${error.message}`);
  }

  return {
    ...data,
    fleet: data.fleets as unknown as FleetInvitationWithDetails['fleet'],
    inviter: data.users as unknown as FleetInvitationWithDetails['inviter'],
  };
}

/**
 * Accept an invitation and join fleet
 */
export async function acceptInvitation(
  code: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; fleetId: string; memberId: string }> {
  // Fetch the invitation
  const invitation = await fetchInvitationByCode(code);

  if (!invitation) {
    throw new Error('Invalid invitation code');
  }

  // Validate invitation
  if (invitation.status !== 'pending') {
    throw new Error(`This invitation has already been ${invitation.status}`);
  }

  if (new Date(invitation.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from('fleet_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
    throw new Error('This invitation has expired');
  }

  // Verify email matches (case-insensitive)
  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('This invitation was sent to a different email address');
  }

  // Add user to fleet
  const member = await addFleetMember(invitation.fleet_id, userId, invitation.role);

  // Update invitation status
  const { error: updateError } = await supabase
    .from('fleet_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: userId,
    })
    .eq('id', invitation.id);

  if (updateError) {
    console.error('Failed to update invitation status:', updateError);
    // Don't throw - member was added successfully
  }

  return {
    success: true,
    fleetId: invitation.fleet_id,
    memberId: member.id,
  };
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { data: invitation, error: fetchError } = await supabase
    .from('fleet_invitations')
    .select('status')
    .eq('id', invitationId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invitation: ${fetchError.message}`);
  }

  if (invitation.status !== 'pending') {
    throw new Error('Only pending invitations can be canceled');
  }

  const { error } = await supabase
    .from('fleet_invitations')
    .update({ status: 'canceled' })
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`);
  }
}

/**
 * Resend an invitation (regenerate code and extend expiration)
 */
export async function resendInvitation(
  invitationId: string,
  expiresInDays: number = DEFAULT_EXPIRATION_DAYS
): Promise<FleetInvitation> {
  // Get current invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('fleet_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invitation: ${fetchError.message}`);
  }

  if (invitation.status !== 'pending') {
    throw new Error('Only pending invitations can be resent');
  }

  // Generate new code and expiration
  const newCode = generateInvitationCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('fleet_invitations')
    .update({
      invitation_code: newCode,
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resend invitation: ${error.message}`);
  }

  return data;
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(fleetId?: string): Promise<number> {
  let query = supabase
    .from('fleet_invitations')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  if (fleetId) {
    query = query.eq('fleet_id', fleetId);
  }

  const { data, error } = await query.select('id');

  if (error) {
    throw new Error(`Failed to cleanup invitations: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Get invitation history for a fleet
 */
export async function fetchInvitationHistory(
  fleetId: string,
  limit: number = 50
): Promise<FleetInvitationWithDetails[]> {
  const { data, error } = await supabase
    .from('fleet_invitations')
    .select(`
      *,
      fleets (id, name, company_name),
      users!invited_by (name, email)
    `)
    .eq('fleet_id', fleetId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch invitation history: ${error.message}`);
  }

  return (data || []).map((inv) => ({
    ...inv,
    fleet: inv.fleets as unknown as FleetInvitationWithDetails['fleet'],
    inviter: inv.users as unknown as FleetInvitationWithDetails['inviter'],
  }));
}
