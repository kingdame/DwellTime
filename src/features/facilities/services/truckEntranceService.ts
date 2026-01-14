/**
 * Truck Entrance Service
 * Handles crowdsourced truck entrance information
 */

import { supabase } from '@/shared/lib/supabase';
import type {
  TruckEntranceReport,
  TruckEntranceReportInput,
  TruckEntranceInfo,
} from '@/shared/types/truck-entrance';

/**
 * Submit a new truck entrance report
 */
export async function submitTruckEntranceReport(
  userId: string,
  input: TruckEntranceReportInput
): Promise<TruckEntranceReport> {
  const { data, error } = await supabase
    .from('truck_entrance_reports')
    .insert({
      user_id: userId,
      facility_id: input.facility_id,
      report_type: input.report_type,
      entrance_different: input.entrance_different,
      entrance_address: input.entrance_address || null,
      entrance_lat: input.entrance_lat || null,
      entrance_lng: input.entrance_lng || null,
      entrance_notes: input.entrance_notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit truck entrance report: ${error.message}`);
  }

  return data;
}

/**
 * Confirm existing truck entrance info
 */
export async function confirmTruckEntrance(
  userId: string,
  facilityId: string
): Promise<TruckEntranceReport> {
  return submitTruckEntranceReport(userId, {
    facility_id: facilityId,
    report_type: 'confirm',
    entrance_different: true,
  });
}

/**
 * Report truck entrance as incorrect
 */
export async function reportTruckEntranceIncorrect(
  userId: string,
  facilityId: string,
  notes?: string
): Promise<TruckEntranceReport> {
  return submitTruckEntranceReport(userId, {
    facility_id: facilityId,
    report_type: 'incorrect',
    entrance_different: false,
    entrance_notes: notes,
  });
}

/**
 * Get user's report for a facility
 */
export async function getUserTruckEntranceReport(
  userId: string,
  facilityId: string
): Promise<TruckEntranceReport | null> {
  const { data, error } = await supabase
    .from('truck_entrance_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to fetch user report: ${error.message}`);
  }

  return data;
}

/**
 * Get all reports for a facility
 */
export async function getFacilityTruckEntranceReports(
  facilityId: string,
  limit: number = 10
): Promise<TruckEntranceReport[]> {
  const { data, error } = await supabase
    .from('truck_entrance_reports')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch truck entrance reports: ${error.message}`);
  }

  return data || [];
}

/**
 * Get facilities with truck entrance info in an area
 */
export async function getFacilitiesWithTruckEntrance(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  limit: number = 50
): Promise<Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
  truck_entrance_lat: number;
  truck_entrance_lng: number;
  truck_entrance_notes: string | null;
}>> {
  const { data, error } = await supabase
    .from('facilities')
    .select(`
      id,
      name,
      lat,
      lng,
      truck_entrance_lat,
      truck_entrance_lng,
      truck_entrance_notes
    `)
    .eq('truck_entrance_different', true)
    .not('truck_entrance_lat', 'is', null)
    .not('truck_entrance_lng', 'is', null)
    .gte('lat', minLat)
    .lte('lat', maxLat)
    .gte('lng', minLng)
    .lte('lng', maxLng)
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch facilities with truck entrance: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if user has already reported on this facility
 */
export async function hasUserReported(
  userId: string,
  facilityId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('truck_entrance_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('facility_id', facilityId);

  if (error) {
    console.error('Error checking user report:', error);
    return false;
  }

  return (count || 0) > 0;
}
