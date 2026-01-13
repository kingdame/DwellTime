/**
 * Fleet Management Types
 * Types for fleet management, team members, and fleet-level invoicing
 */

import type { UUID } from '@/shared/types';

// ============================================================================
// Enums
// ============================================================================

export type FleetRole = 'admin' | 'driver';

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'removed';

export type FleetSubscriptionTier = 'small_fleet' | 'fleet' | 'enterprise';

export type FleetSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export type FleetInvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid';

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Fleet - Represents a trucking company/fleet organization
 */
export interface Fleet {
  id: UUID;
  name: string;
  owner_id: UUID;
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  dot_number: string | null;
  mc_number: string | null;
  logo_url: string | null;
  subscription_tier: FleetSubscriptionTier;
  subscription_status: FleetSubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  max_drivers: number;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fleet Settings - Configurable settings for a fleet
 */
export interface FleetSettings {
  id: UUID;
  fleet_id: UUID;
  default_hourly_rate: number;
  default_grace_period_minutes: number;
  require_photo_evidence: boolean;
  require_gps_verification: boolean;
  auto_generate_invoices: boolean;
  invoice_frequency: 'weekly' | 'biweekly' | 'monthly' | 'manual';
  invoice_recipient_email: string | null;
  invoice_cc_emails: string[];
  invoice_terms: string | null;
  invoice_notes: string | null;
  notification_preferences: {
    detention_start: boolean;
    detention_end: boolean;
    invoice_generated: boolean;
    payment_received: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Fleet Member - A user who belongs to a fleet (admin or driver)
 */
export interface FleetMember {
  id: UUID;
  fleet_id: UUID;
  user_id: UUID;
  role: FleetRole;
  status: MemberStatus;
  driver_id_number: string | null;
  truck_number: string | null;
  trailer_number: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  hourly_rate_override: number | null;
  grace_period_override: number | null;
  invited_by: UUID | null;
  invited_at: string | null;
  joined_at: string | null;
  suspended_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fleet Invitation - Pending invitation to join a fleet
 */
export interface FleetInvitation {
  id: UUID;
  fleet_id: UUID;
  email: string;
  phone: string | null;
  role: FleetRole;
  invited_by: UUID;
  invitation_code: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

/**
 * Fleet Invoice - Consolidated invoice for a fleet's detention events
 */
export interface FleetInvoice {
  id: UUID;
  fleet_id: UUID;
  invoice_number: string;
  detention_event_ids: UUID[];
  driver_ids: UUID[];
  recipient_email: string | null;
  cc_emails: string[];
  total_amount: number;
  total_detention_minutes: number;
  event_count: number;
  pdf_url: string | null;
  status: FleetInvoiceStatus;
  notes: string | null;
  period_start: string;
  period_end: string;
  sent_at: string | null;
  paid_at: string | null;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Computed/Aggregate Types
// ============================================================================

/**
 * Driver Metrics - Performance metrics for a driver
 */
export interface DriverMetrics {
  user_id: UUID;
  member_id: UUID;
  name: string | null;
  email: string | null;
  truck_number: string | null;
  total_detention_events: number;
  total_detention_minutes: number;
  total_detention_amount: number;
  average_wait_time_minutes: number;
  events_this_week: number;
  events_this_month: number;
  amount_this_week: number;
  amount_this_month: number;
  last_event_date: string | null;
}

/**
 * Fleet Summary - Aggregate summary for fleet dashboard
 */
export interface FleetSummary {
  fleet_id: UUID;
  fleet_name: string;
  total_drivers: number;
  active_drivers: number;
  pending_invitations: number;
  total_detention_events: number;
  total_detention_amount: number;
  total_detention_minutes: number;
  unpaid_invoice_count: number;
  unpaid_invoice_amount: number;
  events_this_week: number;
  events_this_month: number;
  amount_this_week: number;
  amount_this_month: number;
  top_facilities: Array<{
    facility_id: UUID;
    facility_name: string;
    event_count: number;
    total_wait_minutes: number;
  }>;
}

// ============================================================================
// Input/Create Types
// ============================================================================

export interface FleetCreateInput {
  name: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  dot_number?: string;
  mc_number?: string;
}

export interface FleetMemberInviteInput {
  email: string;
  phone?: string;
  role: FleetRole;
  driver_id_number?: string;
  truck_number?: string;
}

export interface FleetSettingsUpdateInput {
  default_hourly_rate?: number;
  default_grace_period_minutes?: number;
  require_photo_evidence?: boolean;
  require_gps_verification?: boolean;
  auto_generate_invoices?: boolean;
  invoice_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'manual';
  invoice_recipient_email?: string;
  invoice_cc_emails?: string[];
  invoice_terms?: string;
  invoice_notes?: string;
  notification_preferences?: Partial<FleetSettings['notification_preferences']>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface FleetWithMembers extends Fleet {
  members: FleetMember[];
  settings: FleetSettings | null;
}

export interface FleetMemberWithUser extends FleetMember {
  user: {
    id: UUID;
    email: string;
    name: string | null;
  } | null;
}
