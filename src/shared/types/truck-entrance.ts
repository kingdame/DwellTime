/**
 * Truck Entrance Types
 * Types for crowdsourced truck entrance information
 */

export type TruckEntranceReportType = 'new' | 'confirm' | 'update' | 'incorrect';

export interface TruckEntranceInfo {
  different: boolean;
  address: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  verifiedCount: number;
  lastUpdatedAt: string | null;
}

export interface TruckEntranceReport {
  id: string;
  facility_id: string;
  user_id: string;
  report_type: TruckEntranceReportType;
  entrance_different: boolean;
  entrance_address: string | null;
  entrance_lat: number | null;
  entrance_lng: number | null;
  entrance_notes: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface TruckEntranceReportInput {
  facility_id: string;
  report_type: TruckEntranceReportType;
  entrance_different: boolean;
  entrance_address?: string;
  entrance_lat?: number;
  entrance_lng?: number;
  entrance_notes?: string;
}

/**
 * Check if facility has truck entrance info
 */
export function hasTruckEntranceInfo(
  facility: {
    truck_entrance_different?: boolean | null;
    truck_entrance_address?: string | null;
    truck_entrance_lat?: number | null;
    truck_entrance_lng?: number | null;
  }
): boolean {
  return Boolean(
    facility.truck_entrance_different &&
    (facility.truck_entrance_address ||
     (facility.truck_entrance_lat && facility.truck_entrance_lng))
  );
}

/**
 * Extract truck entrance info from facility
 */
export function extractTruckEntranceInfo(
  facility: {
    truck_entrance_different?: boolean | null;
    truck_entrance_address?: string | null;
    truck_entrance_lat?: number | null;
    truck_entrance_lng?: number | null;
    truck_entrance_notes?: string | null;
    truck_entrance_verified_count?: number | null;
    truck_entrance_last_updated_at?: string | null;
  }
): TruckEntranceInfo {
  return {
    different: facility.truck_entrance_different ?? false,
    address: facility.truck_entrance_address ?? null,
    lat: facility.truck_entrance_lat ?? null,
    lng: facility.truck_entrance_lng ?? null,
    notes: facility.truck_entrance_notes ?? null,
    verifiedCount: facility.truck_entrance_verified_count ?? 0,
    lastUpdatedAt: facility.truck_entrance_last_updated_at ?? null,
  };
}

/**
 * Get verification status text
 */
export function getVerificationStatus(count: number): {
  status: 'unverified' | 'low' | 'moderate' | 'high';
  label: string;
  color: string;
} {
  if (count === 0) {
    return { status: 'unverified', label: 'Not verified', color: '#6B7280' };
  }
  if (count <= 2) {
    return { status: 'low', label: `${count} verification${count > 1 ? 's' : ''}`, color: '#F59E0B' };
  }
  if (count <= 5) {
    return { status: 'moderate', label: `${count} verifications`, color: '#84CC16' };
  }
  return { status: 'high', label: `${count} verifications`, color: '#22C55E' };
}
