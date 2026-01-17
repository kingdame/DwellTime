/**
 * Truck Entrance Service
 * Utility functions for truck entrance reports
 *
 * NOTE: Data operations now use Convex. Use the hooks from @/shared/hooks/convex
 */

export interface TruckEntranceReport {
  id: string;
  facilityId: string;
  userId: string;
  reportType: 'new' | 'confirm' | 'update' | 'incorrect';
  entranceDifferent: boolean;
  entranceAddress?: string;
  entranceLat?: number;
  entranceLng?: number;
  entranceNotes?: string;
  isVerified: boolean;
  verifiedAt?: number;
}

/**
 * Format report type for display
 */
export function formatReportType(type: TruckEntranceReport['reportType']): string {
  switch (type) {
    case 'new':
      return 'New Report';
    case 'confirm':
      return 'Confirmation';
    case 'update':
      return 'Update';
    case 'incorrect':
      return 'Marked Incorrect';
    default:
      return 'Unknown';
  }
}

/**
 * Check if entrance coordinates are valid
 */
export function isValidCoordinates(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
