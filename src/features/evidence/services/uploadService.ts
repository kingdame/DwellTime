/**
 * Upload Service
 * Handles photo uploads to Cloudflare R2 storage via Supabase Edge Functions
 */

import { supabase } from '@/shared/lib/supabase';
import { type PhotoMetadata } from './photoService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  photoId?: string;
  error?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  photoId: string;
}

/**
 * Get a presigned URL for uploading to R2
 */
async function getPresignedUrl(
  detentionEventId: string,
  category: string,
  mimeType: string
): Promise<PresignedUrlResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('presigned-url', {
      body: {
        detentionEventId,
        category,
        mimeType,
      },
    });

    if (error) {
      console.error('Failed to get presigned URL:', error);
      return null;
    }

    return data as PresignedUrlResponse;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return null;
  }
}

/**
 * Upload a photo to R2 using presigned URL
 */
async function uploadToR2(
  uploadUrl: string,
  photoUri: string,
  mimeType: string,
  _onProgress?: (progress: UploadProgress) => void // TODO: Implement progress tracking
): Promise<boolean> {
  try {
    // Read the file as blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Upload to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': mimeType,
      },
    });

    return uploadResponse.ok;
  } catch (error) {
    console.error('R2 upload error:', error);
    return false;
  }
}

/**
 * Save photo metadata to Supabase database
 */
async function savePhotoMetadata(
  photoId: string,
  detentionEventId: string,
  photo: PhotoMetadata,
  publicUrl: string
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('photos').insert({
      id: photoId,
      event_id: detentionEventId,
      url: publicUrl,
      category: photo.category,
      lat: photo.gps?.lat ?? null,
      lng: photo.gps?.lng ?? null,
      taken_at: photo.timestamp,
      width: photo.width,
      height: photo.height,
      device_make: photo.exifData?.make ?? null,
      device_model: photo.exifData?.model ?? null,
    });

    if (error) {
      console.error('Failed to save photo metadata:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving photo metadata:', error);
    return false;
  }
}

/**
 * Upload a photo and save its metadata
 */
export async function uploadPhoto(
  photo: PhotoMetadata,
  detentionEventId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const mimeType = 'image/jpeg'; // Expo image picker typically returns JPEG

    // Step 1: Get presigned URL
    const presignedData = await getPresignedUrl(
      detentionEventId,
      photo.category,
      mimeType
    );

    if (!presignedData) {
      return {
        success: false,
        error: 'Failed to get upload URL',
      };
    }

    // Step 2: Upload to R2
    const uploadSuccess = await uploadToR2(
      presignedData.uploadUrl,
      photo.uri,
      mimeType,
      onProgress
    );

    if (!uploadSuccess) {
      return {
        success: false,
        error: 'Failed to upload photo',
      };
    }

    // Step 3: Save metadata to database
    const saveSuccess = await savePhotoMetadata(
      presignedData.photoId,
      detentionEventId,
      photo,
      presignedData.publicUrl
    );

    if (!saveSuccess) {
      return {
        success: false,
        error: 'Failed to save photo metadata',
      };
    }

    return {
      success: true,
      url: presignedData.publicUrl,
      photoId: presignedData.photoId,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  photos: PhotoMetadata[],
  detentionEventId: string,
  onPhotoProgress?: (index: number, progress: UploadProgress) => void,
  onPhotoComplete?: (index: number, result: UploadResult) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < photos.length; i++) {
    const result = await uploadPhoto(
      photos[i],
      detentionEventId,
      (progress) => onPhotoProgress?.(i, progress)
    );
    results.push(result);
    onPhotoComplete?.(i, result);
  }

  return results;
}

/**
 * Delete a photo from storage and database
 */
export async function deletePhoto(photoId: string): Promise<boolean> {
  try {
    // Delete from database (storage cleanup can be handled by a background job)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error('Failed to delete photo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get all photos for a detention event
 */
export async function getPhotosForEvent(
  detentionEventId: string
): Promise<PhotoMetadata[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('photos')
      .select('*')
      .eq('event_id', detentionEventId)
      .order('taken_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch photos:', error);
      return [];
    }

    // Map database records to PhotoMetadata format
    return (data || []).map((record: {
      url: string;
      width: number;
      height: number;
      taken_at: string;
      category: string;
      lat: number | null;
      lng: number | null;
      device_make: string | undefined;
      device_model: string | undefined;
    }) => ({
      uri: record.url,
      width: record.width,
      height: record.height,
      timestamp: record.taken_at,
      category: record.category,
      gps: record.lat && record.lng
        ? { lat: record.lat, lng: record.lng, accuracy: null }
        : null,
      exifData: record.device_make || record.device_model
        ? { make: record.device_make, model: record.device_model }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}
