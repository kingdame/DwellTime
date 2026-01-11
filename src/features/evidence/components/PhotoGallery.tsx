/**
 * PhotoGallery Component
 * Displays a grid of captured photos for the current detention
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
} from 'react-native';

import { type PhotoMetadata, type PhotoCategory } from '../services/photoService';
import { PhotoPreview } from './PhotoPreview';
import { CategorySelector } from './CategorySelector';

interface PhotoGalleryProps {
  /** Array of photos to display */
  photos: PhotoMetadata[];
  /** Called when a photo is deleted */
  onDeletePhoto?: (index: number) => void;
  /** Called when a photo category is changed */
  onUpdateCategory?: (index: number, category: PhotoCategory) => void;
  /** Number of columns in the grid */
  columns?: number;
  /** Whether photos can be edited/deleted */
  editable?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export function PhotoGallery({
  photos,
  onDeletePhoto,
  onUpdateCategory,
  columns = 3,
  editable = true,
  emptyMessage = 'No photos captured yet',
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const gap = 4;
  const itemWidth = (screenWidth - gap * (columns + 1)) / columns;

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const handlePhotoPress = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setShowCategoryModal(false);
  };

  const handleDelete = () => {
    if (selectedIndex !== null && onDeletePhoto) {
      onDeletePhoto(selectedIndex);
      handleClose();
    }
  };

  const handleCategoryPress = () => {
    setShowCategoryModal(true);
  };

  const handleCategorySelect = (category: PhotoCategory) => {
    if (selectedIndex !== null && onUpdateCategory) {
      onUpdateCategory(selectedIndex, category);
    }
    setShowCategoryModal(false);
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <Text style={styles.emptyHint}>Tap the camera button to add photos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Photo Grid */}
      <FlatList
        data={photos}
        numColumns={columns}
        keyExtractor={(_, index) => `photo-${index}`}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={columns > 1 ? { gap } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.gridItem, { width: itemWidth }]}
            onPress={() => handlePhotoPress(index)}
            activeOpacity={0.8}
          >
            <PhotoPreview
              photo={item}
              compact
              width={itemWidth}
              showActions={false}
            />
          </TouchableOpacity>
        )}
      />

      {/* Photo count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Text>
        {photos.filter((p) => p.gps).length < photos.length && (
          <Text style={styles.warningText}>
            ⚠️ {photos.length - photos.filter((p) => p.gps).length} without GPS
          </Text>
        )}
      </View>

      {/* Full-screen preview modal */}
      <Modal
        visible={selectedIndex !== null}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
              <Text style={styles.headerButtonText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedIndex !== null ? `${selectedIndex + 1} of ${photos.length}` : ''}
            </Text>
            <View style={styles.headerButton} />
          </View>

          {/* Photo Preview */}
          {selectedPhoto && (
            <PhotoPreview
              photo={selectedPhoto}
              showActions={editable}
              onDelete={editable ? handleDelete : undefined}
              onCategoryPress={editable ? handleCategoryPress : undefined}
            />
          )}

          {/* Category Modal */}
          {selectedPhoto && (
            <CategorySelector
              mode="modal"
              selectedCategory={selectedPhoto.category}
              onSelect={handleCategorySelect}
              visible={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

/**
 * Compact gallery summary showing photo count with thumbnails
 */
export function PhotoGallerySummary({
  photos,
  onPress,
  maxThumbnails = 4,
}: {
  photos: PhotoMetadata[];
  onPress?: () => void;
  maxThumbnails?: number;
}) {
  const thumbnailSize = 50;
  const remaining = Math.max(0, photos.length - maxThumbnails);

  if (photos.length === 0) {
    return (
      <TouchableOpacity style={styles.summaryEmpty} onPress={onPress}>
        <Text style={styles.summaryEmptyText}>+ Add Photos</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.summaryContainer} onPress={onPress}>
      <View style={styles.thumbnailRow}>
        {photos.slice(0, maxThumbnails).map((photo, index) => (
          <View
            key={index}
            style={[
              styles.thumbnail,
              { width: thumbnailSize, height: thumbnailSize },
              index > 0 && { marginLeft: -12 },
            ]}
          >
            <PhotoPreview photo={photo} compact width={thumbnailSize} showActions={false} />
          </View>
        ))}
        {remaining > 0 && (
          <View style={[styles.remainingBadge, { marginLeft: -12 }]}>
            <Text style={styles.remainingText}>+{remaining}</Text>
          </View>
        )}
      </View>
      <Text style={styles.summaryCount}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    padding: 4,
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
  },
  countText: {
    color: '#8E8E93',
    fontSize: 13,
  },
  warningText: {
    color: '#FF9500',
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerButton: {
    width: 60,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Summary
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    marginRight: 12,
  },
  thumbnail: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  remainingBadge: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#38383A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  remainingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCount: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  summaryEmpty: {
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38383A',
    borderStyle: 'dashed',
  },
  summaryEmptyText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PhotoGallery;
