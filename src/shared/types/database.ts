/**
 * DwellTime Database Types
 * Based on SRS Document schema
 * These will be auto-generated from Supabase once connected
 */

export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name: string | null;
  company_name: string | null;
  phone: string | null;
  hourly_rate: number;
  grace_period_minutes: number;
  invoice_logo_url: string | null;
  invoice_terms: string | null;
  subscription_tier: 'free' | 'pro' | 'fleet';
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: UUID;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number;
  lng: number;
  facility_type: 'shipper' | 'receiver' | 'both' | 'unknown';
  avg_wait_minutes: number | null;
  avg_rating: number | null;
  total_reviews: number;
  // Amenities
  overnight_parking: boolean | null;
  parking_spaces: number | null;
  restrooms: boolean | null;
  driver_lounge: boolean | null;
  water_available: boolean | null;
  vending_machines: boolean | null;
  wifi_available: boolean | null;
  showers_available: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DetentionEvent {
  id: UUID;
  user_id: UUID;
  facility_id: UUID | null;
  load_reference: string | null;
  event_type: 'pickup' | 'delivery';
  arrival_time: string;
  departure_time: string | null;
  grace_period_end: string | null;
  detention_start: string | null;
  detention_minutes: number;
  hourly_rate: number;
  total_amount: number;
  status: 'active' | 'completed' | 'invoiced' | 'paid';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GpsLog {
  id: UUID;
  detention_event_id: UUID;
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: string;
}

export interface Photo {
  id: UUID;
  detention_event_id: UUID;
  storage_url: string;
  category: 'dock' | 'bol' | 'conditions' | 'checkin' | 'other';
  lat: number | null;
  lng: number | null;
  timestamp: string | null;
  caption: string | null;
}

export interface FacilityReview {
  id: UUID;
  user_id: UUID;
  facility_id: UUID;
  detention_event_id: UUID | null;
  overall_rating: number;
  wait_time_rating: number | null;
  staff_rating: number | null;
  restroom_rating: number | null;
  parking_rating: number | null;
  safety_rating: number | null;
  cleanliness_rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface Invoice {
  id: UUID;
  user_id: UUID;
  invoice_number: string;
  detention_event_ids: UUID[];
  recipient_email: string | null;
  total_amount: number;
  pdf_url: string | null;
  status: 'draft' | 'sent' | 'paid';
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

// Subscription types
export interface Subscription {
  id: UUID;
  user_id: UUID;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: 'free' | 'pro' | 'fleet' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}
