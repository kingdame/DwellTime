/**
 * Upload Service
 * Utility functions for photo uploads
 *
 * NOTE: File uploads now use Convex with R2 storage.
 * Use: useMutation(api.photos.upload) for uploading photos
 */

import * as ImagePicker from 'expo-image-picker';

export interface PhotoUpload {
  uri: string;
  type: string;
  fileName: string;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Launch camera to take a photo
 */
export async function takePhoto(): Promise<PhotoUpload | null> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    throw new Error('Camera permission required');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    quality: 0.8,
    allowsEditing: false,
    exif: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `photo-${Date.now()}.jpg`,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Pick photo from media library
 */
export async function pickPhoto(): Promise<PhotoUpload | null> {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    quality: 0.8,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `photo-${Date.now()}.jpg`,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get photo category label
 */
export function getPhotoCategoryLabel(category: string): string {
  switch (category) {
    case 'arrival':
      return 'Arrival';
    case 'departure':
      return 'Departure';
    case 'dock':
      return 'Dock';
    case 'paperwork':
      return 'Paperwork';
    case 'other':
      return 'Other';
    default:
      return category;
  }
}

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Check if file size is valid
 */
export function isValidFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE;
}
