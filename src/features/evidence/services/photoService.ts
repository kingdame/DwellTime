/**
 * Photo Capture Service
 * Uses expo-image-picker for battery-efficient photo capture with GPS/EXIF
 */

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export type PhotoCategory = 'dock' | 'bol' | 'conditions' | 'checkin' | 'other';

export interface PhotoMetadata {
  uri: string;
  width: number;
  height: number;
  timestamp: string;
  category: PhotoCategory;
  gps: {
    lat: number;
    lng: number;
    accuracy: number | null;
  } | null;
  exifData: {
    make?: string;
    model?: string;
    orientation?: number;
  } | null;
}

export interface CaptureResult {
  success: boolean;
  photo?: PhotoMetadata;
  error?: string;
}

/**
 * Request camera and media library permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

  if (cameraStatus !== 'granted') {
    return false;
  }

  // Also request location for GPS fallback (result is intentionally ignored - location is optional)
  await Location.requestForegroundPermissionsAsync();

  // Camera permission is required, location is optional (we prefer EXIF)
  return cameraStatus === 'granted';
}

/**
 * Get current GPS location as fallback if EXIF doesn't have it
 */
async function getFallbackLocation(): Promise<{ lat: number; lng: number; accuracy: number | null } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.warn('Failed to get fallback location:', error);
    return null;
  }
}

/**
 * Extract GPS coordinates from EXIF data
 */
function extractGpsFromExif(exif: Record<string, unknown> | undefined): { lat: number; lng: number; accuracy: number | null } | null {
  if (!exif) return null;

  // EXIF GPS data can come in different formats
  const lat = exif.GPSLatitude as number | undefined;
  const lng = exif.GPSLongitude as number | undefined;
  const latRef = exif.GPSLatitudeRef as string | undefined;
  const lngRef = exif.GPSLongitudeRef as string | undefined;

  if (typeof lat === 'number' && typeof lng === 'number') {
    // Apply hemisphere reference (S/W are negative)
    const finalLat = latRef === 'S' ? -Math.abs(lat) : lat;
    const finalLng = lngRef === 'W' ? -Math.abs(lng) : lng;

    return {
      lat: finalLat,
      lng: finalLng,
      accuracy: null, // EXIF doesn't include accuracy
    };
  }

  return null;
}

/**
 * Capture a photo using the native camera
 * Returns photo with GPS coordinates (from EXIF or fallback location)
 */
export async function capturePhoto(category: PhotoCategory = 'other'): Promise<CaptureResult> {
  try {
    // Check permissions first
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Camera permission denied',
      };
    }

    // Launch native camera with EXIF enabled
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false, // Keep original with EXIF intact
      quality: 0.8, // Good quality, reasonable file size
      exif: true, // Request EXIF data including GPS
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'Photo capture cancelled',
      };
    }

    const asset = result.assets[0];
    const timestamp = new Date().toISOString();

    // Try to get GPS from EXIF first (convert null to undefined for type safety)
    let gps = extractGpsFromExif(asset.exif ?? undefined);

    // Fallback to current location if EXIF doesn't have GPS
    if (!gps) {
      gps = await getFallbackLocation();
    }

    // Extract useful EXIF metadata
    const exifData = asset.exif ? {
      make: asset.exif.Make as string | undefined,
      model: asset.exif.Model as string | undefined,
      orientation: asset.exif.Orientation as number | undefined,
    } : null;

    const photo: PhotoMetadata = {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      timestamp,
      category,
      gps,
      exifData,
    };

    return {
      success: true,
      photo,
    };
  } catch (error) {
    console.error('Photo capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pick a photo from the library (for selecting existing photos)
 */
export async function pickPhotoFromLibrary(category: PhotoCategory = 'other'): Promise<CaptureResult> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        error: 'Media library permission denied',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
      exif: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'Photo selection cancelled',
      };
    }

    const asset = result.assets[0];
    const timestamp = new Date().toISOString();

    // Try to get GPS from EXIF (library photos should have it if taken with location enabled)
    const gps = extractGpsFromExif(asset.exif ?? undefined);

    const exifData = asset.exif ? {
      make: asset.exif.Make as string | undefined,
      model: asset.exif.Model as string | undefined,
      orientation: asset.exif.Orientation as number | undefined,
    } : null;

    const photo: PhotoMetadata = {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      timestamp,
      category,
      gps,
      exifData,
    };

    return {
      success: true,
      photo,
    };
  } catch (error) {
    console.error('Photo pick error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format GPS coordinates for display
 */
export function formatGpsCoordinates(gps: { lat: number; lng: number } | null): string {
  if (!gps) return 'No GPS';

  const latDir = gps.lat >= 0 ? 'N' : 'S';
  const lngDir = gps.lng >= 0 ? 'E' : 'W';

  return `${Math.abs(gps.lat).toFixed(6)}${latDir}, ${Math.abs(gps.lng).toFixed(6)}${lngDir}`;
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(category: PhotoCategory): string {
  const labels: Record<PhotoCategory, string> = {
    dock: 'Dock',
    bol: 'Bill of Lading',
    conditions: 'Conditions',
    checkin: 'Check-in',
    other: 'Other',
  };
  return labels[category];
}

/**
 * Get category icon name (for use with icon libraries)
 */
export function getCategoryIcon(category: PhotoCategory): string {
  const icons: Record<PhotoCategory, string> = {
    dock: 'warehouse',
    bol: 'file-text',
    conditions: 'alert-triangle',
    checkin: 'check-circle',
    other: 'image',
  };
  return icons[category];
}
