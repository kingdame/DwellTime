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

// Components
export { FacilitySearch } from './components/FacilitySearch';
export { AddFacilityForm } from './components/AddFacilityForm';
