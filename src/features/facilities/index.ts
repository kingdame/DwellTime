/**
 * Facilities Feature Exports
 */

// Services
export {
  searchFacilities,
  findNearbyFacilities,
  getFacility,
  createFacility,
  isWithinGeofence,
  detectCurrentFacility,
  getRecentFacilities,
  searchFacilitiesWithFilters,
  getPopularFacilities,
  GEOFENCE_RADIUS_METERS,
  type FacilitySearchFilters,
  type FacilityCreateInput,
  type NearbyFacility,
} from './services/facilityService';

// Hooks
export {
  useFacilitySearch,
  useNearbyFacilities,
  useFacility,
  useDetectFacility,
  useRecentFacilities,
  useFacilitiesWithFilters,
  usePopularFacilities,
  useCreateFacility,
} from './hooks/useFacilities';

export {
  useGeofencing,
  type GeofenceState,
  type GeofenceEvent,
} from './hooks/useGeofencing';

// Payment Stats Hooks
export {
  useFacilityPaymentStats,
  useFacilityReliability,
  usePendingFollowUps,
  useFollowUpHistory,
  useRecordPaymentResponse,
  useScheduleFollowUp,
  useFacilitiesByPaymentRate,
  usePendingFollowUpCount,
} from './hooks/usePaymentStats';

// Payment Stats Service
export {
  fetchFacilityPaymentStats,
  getFacilityReliability,
  fetchPendingFollowUps,
  fetchAllFollowUps,
  recordPaymentResponse,
  autoScheduleFollowUp,
  fetchFacilitiesByPaymentRate,
} from './services/paymentStatsService';

// Components
export { FacilitySearch } from './components/FacilitySearch';
export { AddFacilityForm } from './components/AddFacilityForm';
export { PaymentReliabilityCard, PaymentReliabilityBadge } from './components/PaymentReliabilityCard';
export { PaymentFollowUpModal } from './components/PaymentFollowUpModal';
