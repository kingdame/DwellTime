/**
 * Google Maps Configuration
 * 
 * Provides access to Google Maps API services via JavaScript SDK (for web)
 * and REST API proxy (for native apps)
 * 
 * - Places Autocomplete
 * - Geocoding
 * - Place Details
 */

// API Key from environment
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn(
    'Google Maps API key not found. Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.'
  );
}

// Track if Google Maps JS SDK is loaded
let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;
let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let geocoder: google.maps.Geocoder | null = null;

/**
 * Load Google Maps JavaScript SDK
 */
export function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  if (typeof window === 'undefined') {
    // Server-side or native - skip script loading
    return Promise.reject(new Error('Google Maps JS SDK only available in browser'));
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      googleMapsLoaded = true;
      initServices();
      resolve();
      return;
    }

    // Create script tag
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      initServices();
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps SDK'));
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

/**
 * Initialize Google Maps services
 */
function initServices() {
  if (!window.google?.maps) return;
  
  autocompleteService = new google.maps.places.AutocompleteService();
  geocoder = new google.maps.Geocoder();
  
  // PlacesService requires a DOM element
  const dummyDiv = document.createElement('div');
  placesService = new google.maps.places.PlacesService(dummyDiv);
}

/**
 * Place prediction from autocomplete
 */
export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

/**
 * Parsed address components
 */
export interface ParsedAddress {
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  name?: string;
}

/**
 * Search for places using autocomplete (via JavaScript SDK)
 */
export async function searchPlaces(
  query: string,
  options?: {
    types?: string[];
    location?: { lat: number; lng: number };
    radius?: number;
  }
): Promise<PlacePrediction[]> {
  if (!GOOGLE_MAPS_API_KEY || !query.trim()) {
    return [];
  }

  try {
    // Load the SDK if not already loaded
    await loadGoogleMapsScript();
    
    if (!autocompleteService) {
      console.warn('Autocomplete service not initialized');
      return [];
    }

    // Build the request
    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      componentRestrictions: { country: 'us' },
    };

    // Add location bias if provided
    if (options?.location) {
      request.location = new google.maps.LatLng(options.location.lat, options.location.lng);
      request.radius = options.radius || 50000;
    }

    // Use Promise wrapper for the callback API
    return new Promise((resolve) => {
      autocompleteService!.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(
            predictions.map((p) => ({
              place_id: p.place_id || '',
              description: p.description || '',
              structured_formatting: {
                main_text: p.structured_formatting?.main_text || '',
                secondary_text: p.structured_formatting?.secondary_text || '',
              },
              types: p.types || [],
            }))
          );
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          console.warn('Places autocomplete error:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Failed to search places:', error);
    return [];
  }
}

/**
 * Get place details including address components (via JavaScript SDK)
 */
export async function getPlaceDetails(placeId: string): Promise<ParsedAddress | null> {
  if (!GOOGLE_MAPS_API_KEY || !placeId) {
    return null;
  }

  try {
    // Load the SDK if not already loaded
    await loadGoogleMapsScript();
    
    if (!placesService) {
      console.warn('Places service not initialized');
      return null;
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'address_components', 'geometry', 'place_id'],
    };

    // Use Promise wrapper for the callback API
    return new Promise((resolve) => {
      placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(parseGooglePlaceResult(place));
        } else {
          console.warn('Place Details error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Failed to get place details:', error);
    return null;
  }
}

/**
 * Geocode an address to coordinates (via JavaScript SDK)
 */
export async function geocodeAddress(address: string): Promise<ParsedAddress | null> {
  if (!GOOGLE_MAPS_API_KEY || !address.trim()) {
    return null;
  }

  try {
    // Load the SDK if not already loaded
    await loadGoogleMapsScript();
    
    if (!geocoder) {
      console.warn('Geocoder not initialized');
      return null;
    }

    const request: google.maps.GeocoderRequest = {
      address: address,
    };

    return new Promise((resolve) => {
      geocoder!.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          resolve(parseGeocoderResult(results[0]));
        } else {
          console.warn('Geocoding error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Failed to geocode address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address (via JavaScript SDK)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ParsedAddress | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    // Load the SDK if not already loaded
    await loadGoogleMapsScript();
    
    if (!geocoder) {
      console.warn('Geocoder not initialized');
      return null;
    }

    const request: google.maps.GeocoderRequest = {
      location: { lat, lng },
    };

    return new Promise((resolve) => {
      geocoder!.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          resolve(parseGeocoderResult(results[0]));
        } else {
          console.warn('Reverse Geocoding error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Failed to reverse geocode:', error);
    return null;
  }
}

/**
 * Parse Google Maps Place result into structured format
 */
function parseGooglePlaceResult(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components || [];
  
  const getComponent = (types: string[]): string | undefined => {
    const component = components.find((c) =>
      types.some((t) => c.types.includes(t))
    );
    return component?.short_name || component?.long_name;
  };

  const getLongComponent = (types: string[]): string | undefined => {
    const component = components.find((c) =>
      types.some((t) => c.types.includes(t))
    );
    return component?.long_name;
  };

  return {
    streetNumber: getComponent(['street_number']),
    street: getLongComponent(['route']),
    city: getLongComponent(['locality', 'sublocality', 'administrative_area_level_2']),
    state: getComponent(['administrative_area_level_1']),
    zip: getComponent(['postal_code']),
    country: getComponent(['country']),
    formattedAddress: place.formatted_address || '',
    lat: place.geometry?.location?.lat() || 0,
    lng: place.geometry?.location?.lng() || 0,
    placeId: place.place_id || '',
    name: place.name,
  };
}

/**
 * Parse Google Maps Geocoder result into structured format
 */
function parseGeocoderResult(result: google.maps.GeocoderResult): ParsedAddress {
  const components = result.address_components || [];
  
  const getComponent = (types: string[]): string | undefined => {
    const component = components.find((c) =>
      types.some((t) => c.types.includes(t))
    );
    return component?.short_name || component?.long_name;
  };

  const getLongComponent = (types: string[]): string | undefined => {
    const component = components.find((c) =>
      types.some((t) => c.types.includes(t))
    );
    return component?.long_name;
  };

  return {
    streetNumber: getComponent(['street_number']),
    street: getLongComponent(['route']),
    city: getLongComponent(['locality', 'sublocality', 'administrative_area_level_2']),
    state: getComponent(['administrative_area_level_1']),
    zip: getComponent(['postal_code']),
    country: getComponent(['country']),
    formattedAddress: result.formatted_address || '',
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
    placeId: result.place_id || '',
    name: undefined, // Geocoder doesn't return names
  };
}

/**
 * Check if Google Maps API is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return !!GOOGLE_MAPS_API_KEY;
}
