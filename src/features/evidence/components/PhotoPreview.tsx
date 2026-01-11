/**
 * PhotoPreview Component
 * Displays captured photo with GPS and timestamp overlay
 */

import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import {
  type PhotoMetadata,
  formatGpsCoordinates,
  getCategoryLabel,
} from '../services/photoService';

interface PhotoPreviewProps {
  /** Photo metadata to display */
  photo: PhotoMetadata;
  /** Called when user wants to change category */
  onCategoryPress?: () => void;
  /** Called when user wants to delete the photo */
  onDelete?: () => void;
  /** Called when user confirms the photo */
  onConfirm?: () => void;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom width (defaults to screen width) */
  width?: number;
  /** Compact mode for gallery view */
  compact?: boolean;
}

export function PhotoPreview({
  photo,
  onCategoryPress,
  onDelete,
  onConfirm,
  showActions = true,
  width,
  compact = false,
}: PhotoPreviewProps) {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = width || screenWidth;
  const aspectRatio = photo.width / photo.height;
  const imageHeight = compact ? imageWidth : imageWidth / aspectRatio;

  const formattedTime = formatTimestamp(photo.timestamp);
  const gpsText = formatGpsCoordinates(photo.gps);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { width: imageWidth }]}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.compactImage, { width: imageWidth, height: imageWidth }]}
          resizeMode="cover"
        />
        <View style={styles.compactOverlay}>
          <Text style={styles.compactCategory}>{getCategoryLabel(photo.category)}</Text>
        </View>
        {photo.gps && <View style={styles.gpsIndicator} />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="contain"
        />

        {/* Metadata Overlay */}
        <View style={styles.overlay}>
          <View style={styles.metadataContainer}>
            {/* Timestamp */}
            <View style={styles.metadataRow}>
              <Text style={styles.metadataIcon}>🕐</Text>
              <Text style={styles.metadataText}>{formattedTime}</Text>
            </View>

            {/* GPS */}
            <View style={styles.metadataRow}>
              <Text style={styles.metadataIcon}>{photo.gps ? '📍' : '⚠️'}</Text>
              <Text style={[styles.metadataText, !photo.gps && styles.noGpsText]}>
                {gpsText}
              </Text>
            </View>

            {/* Category */}
            <TouchableOpacity
              style={styles.categoryBadge}
              onPress={onCategoryPress}
              disabled={!onCategoryPress}
            >
              <Text style={styles.categoryText}>{getCategoryLabel(photo.category)}</Text>
              {onCategoryPress && <Text style={styles.editIcon}>✏️</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsContainer}>
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          {onConfirm && (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Use Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  metadataContainer: {
    gap: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  metadataText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  noGpsText: {
    color: '#FF9500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editIcon: {
    fontSize: 10,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#000000',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#2C2C2E',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Compact styles for gallery view
  compactContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactImage: {
    backgroundColor: '#1a1a1a',
  },
  compactOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
  },
  compactCategory: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  gpsIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
});

export default PhotoPreview;
