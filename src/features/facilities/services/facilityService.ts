/**
 * Facility Service
 * Handles facility search, creation, and geofencing
 */

import { supabase } from '@/shared/lib/supabase';
import type { Facility } from '@/shared/types';
import { calculateDistance } from '@/features/detention/utils/geoUtils';

export interface FacilitySearchFilters {
  query?: string;
  facilityType?: Facility['facility_type'];
  minRating?: number;
  hasAmenities?: {
    overnight_parking?: boolean;
    restrooms?: boolean;
    driver_lounge?: boolean;
    showers_available?: boolean;
  };
}

export interface NearbyFacility extends Facility {
  distance: number; // in meters
}

export interface FacilityCreateInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
  facility_type: Facility['facility_type'];
}

// Geofence radius in meters (standard is ~100m for facility detection)
const GEOFENCE_RADIUS_METERS = 100;

/**
 * Search facilities by name or address
 */
export async function searchFacilities(
  query: string,
  limit: number = 20
): Promise<Facility[]> {
  const searchTerm = `%${query.trim().toLowerCase()}%`;

  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .or(`name.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm}`)
    .order('total_reviews', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching facilities:', error);
    throw new Error(`Failed to search facilities: ${error.message}`);
  }

  return data || [];
}

/**
 * Find facilities near a location
 */
export async function findNearbyFacilities(
  lat: number,
  lng: number,
  radiusMeters: number = 5000, // 5km default
  limit: number = 20
): Promise<NearbyFacility[]> {
  // Calculate bounding box for initial filter (rough approximation)
  // 1 degree of latitude is ~111km
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .gte('lat', minLat)
    .lte('lat', maxLat)
    .gte('lng', minLng)
    .lte('lng', maxLng);

  if (error) {
    console.error('Error finding nearby facilities:', error);
    throw new Error(`Failed to find nearby facilities: ${error.message}`);
  }

  if (!data) return [];

  // Calculate actual distances and filter within radius
  const withDistances: NearbyFacility[] = data
    .map((facility) => ({
      ...facility,
      distance: calculateDistance(lat, lng, facility.lat, facility.lng),
    }))
    .filter((f) => f.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return withDistances;
}

/**
 * Get facility by ID
 */
export async function getFacility(id: string): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching facility:', error);
    throw new Error(`Failed to fetch facility: ${error.message}`);
  }

  return data;
}

/**
 * Create a new facility
 */
export async function createFacility(input: FacilityCreateInput): Promise<Facility> {
  const { data, error } = await supabase
    .from('facilities')
    .insert({
      name: input.name,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      zip: input.zip || null,
      lat: input.lat,
      lng: input.lng,
      facility_type: input.facility_type,
      total_reviews: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating facility:', error);
    throw new Error(`Failed to create facility: ${error.message}`);
  }

  return data;
}

/**
 * Check if driver is within a facility's geofence
 */
export function isWithinGeofence(
  driverLat: number,
  driverLng: number,
  facility: Facility,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): boolean {
  const distance = calculateDistance(driverLat, driverLng, facility.lat, facility.lng);
  return distance <= radiusMeters;
}

/**
 * Find facility that driver is currently at (within geofence)
 */
export async function detectCurrentFacility(
  lat: number,
  lng: number
): Promise<Facility | null> {
  // Search within a small radius (500m) for efficiency
  const nearbyFacilities = await findNearbyFacilities(lat, lng, 500, 10);

  // Find first facility within geofence
  for (const facility of nearbyFacilities) {
    if (facility.distance <= GEOFENCE_RADIUS_METERS) {
      return facility;
    }
  }

  return null;
}

/**
 * Get recently visited facilities for quick selection
 */
export async function getRecentFacilities(
  userId: string,
  limit: number = 5
): Promise<Facility[]> {
  // Get facilities from recent detention events
  const { data, error } = await supabase
    .from('detention_events')
    .select(`
      facility_id,
      facilities (*)
    `)
    .eq('user_id', userId)
    .not('facility_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Get more to dedupe

  if (error) {
    console.error('Error fetching recent facilities:', error);
    return [];
  }

  // Dedupe and extract facilities
  const seen = new Set<string>();
  const facilities: Facility[] = [];

  for (const event of data || []) {
    if (event.facilities && !seen.has(event.facility_id!)) {
      seen.add(event.facility_id!);
      facilities.push(event.facilities as unknown as Facility);
      if (facilities.length >= limit) break;
    }
  }

  return facilities;
}

/**
 * Search facilities with advanced filters
 */
export async function searchFacilitiesWithFilters(
  filters: FacilitySearchFilters,
  limit: number = 20
): Promise<Facility[]> {
  let query = supabase.from('facilities').select('*');

  // Text search
  if (filters.query) {
    const searchTerm = `%${filters.query.trim().toLowerCase()}%`;
    query = query.or(`name.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm}`);
  }

  // Facility type filter
  if (filters.facilityType) {
    query = query.eq('facility_type', filters.facilityType);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    query = query.gte('avg_rating', filters.minRating);
  }

  // Amenities filter
  if (filters.hasAmenities) {
    if (filters.hasAmenities.overnight_parking) {
      query = query.eq('overnight_parking', true);
    }
    if (filters.hasAmenities.restrooms) {
      query = query.eq('restrooms', true);
    }
    if (filters.hasAmenities.driver_lounge) {
      query = query.eq('driver_lounge', true);
    }
    if (filters.hasAmenities.showers_available) {
      query = query.eq('showers_available', true);
    }
  }

  const { data, error } = await query
    .order('total_reviews', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching facilities with filters:', error);
    throw new Error(`Failed to search facilities: ${error.message}`);
  }

  return data || [];
}

/**
 * Get popular facilities (most reviews, highest rated)
 */
export async function getPopularFacilities(limit: number = 10): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .gt('total_reviews', 0)
    .order('avg_rating', { ascending: false, nullsFirst: false })
    .order('total_reviews', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular facilities:', error);
    throw new Error(`Failed to fetch popular facilities: ${error.message}`);
  }

  return data || [];
}

/**
 * Get facility with reviews for preview card
 */
export async function getFacilityWithReviews(
  facilityId: string,
  reviewLimit: number = 5
): Promise<{
  facility: Facility;
  reviews: import('@/shared/types').FacilityReview[];
} | null> {
  // Fetch facility
  const facility = await getFacility(facilityId);
  if (!facility) return null;

  // Fetch reviews
  const { data: reviews, error } = await supabase
    .from('facility_reviews')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .limit(reviewLimit);

  if (error) {
    console.error('Error fetching reviews:', error);
    return { facility, reviews: [] };
  }

  return { facility, reviews: reviews || [] };
}

// Export constants
export { GEOFENCE_RADIUS_METERS };
