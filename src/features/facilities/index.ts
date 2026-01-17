/**
 * Facilities Feature Exports
 *
 * NOTE: Facility data operations now use Convex. Import from @/shared/hooks/convex:
 * - useFacility(id) - Get facility by ID
 * - useSearchFacilities(query) - Search facilities
 * - useNearbyFacilities(lat, lng, radius) - Get nearby facilities
 * - useFacilitiesWithTruckEntrance() - Facilities with truck entrance info
 * - useCreateFacility() - Create facility mutation
 * - useFacilityPaymentStats(facilityId) - Payment statistics
 * - useCreateReview() - Create facility review
 */

// Services - Utility functions only
export {
  calculateDistance,
  sortByDistance,
  filterByRadius,
  formatFacilityAddress,
  formatDistance,
  formatWaitTime,
  formatRating,
  getFacilityTypeLabel,
} from './services/facilityService';

// Payment Stats Service - Utility functions
export {
  type PaymentStat,
  calculatePaymentRate,
  formatPaymentRate,
  formatAvgPaymentDays,
  getPaymentReliabilityLabel,
  getPaymentReliabilityColor,
} from './services/paymentStatsService';

// Truck Entrance Service - Types and utilities
export {
  type TruckEntranceReport,
  formatReportType,
  isValidCoordinates,
} from './services/truckEntranceService';

// Geofencing Hook
export {
  useGeofencing,
  GEOFENCE_RADIUS_METERS,
  type GeofenceState,
  type GeofenceEvent,
} from './hooks/useGeofencing';

// Convex Hooks (re-export for convenience)
export {
  useFacility,
  useSearchFacilities,
  useFacilitiesByCityState,
  useFacilitiesByType,
  useNearbyFacilities,
  useFacilitiesWithTruckEntrance,
  useCreateFacility,
  useUpdateFacility,
  useUpdateTruckEntrance,
  useFacilityReviews,
  useUserReviews,
  useEventReview,
  useFacilityPaymentStats,
  useCreateReview,
  useReportPayment,
} from './hooks/useFacilitiesConvex';

// Components
export { FacilitySearch } from './components/FacilitySearch';
export { AddFacilityForm } from './components/AddFacilityForm';
export { PaymentReliabilityCard, PaymentReliabilityBadge } from './components/PaymentReliabilityCard';
export { PaymentFollowUpModal } from './components/PaymentFollowUpModal';
export { FacilityPreviewCard } from './components/FacilityPreviewCard';
export { FacilityLookup } from './components/FacilityLookup';
export { TruckEntranceCard } from './components/TruckEntranceCard';

// New Premium Components
export { FacilityReviewModal } from './components/FacilityReviewModal';
export { AmenitiesDisplay, AmenitiesCompact } from './components/AmenitiesDisplay';
export { AmenitiesEditModal } from './components/AmenitiesEditModal';
export { FacilityDetailScreen } from './components/FacilityDetailScreen';
export { FacilityMapView } from './components/FacilityMapView';
