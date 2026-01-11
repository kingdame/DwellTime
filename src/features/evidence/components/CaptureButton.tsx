/**
 * CaptureButton Component
 * Floating camera button for capturing detention evidence
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

import { capturePhoto, type PhotoCategory, type PhotoMetadata } from '../services/photoService';

interface CaptureButtonProps {
  /** Called when a photo is successfully captured */
  onPhotoCapture: (photo: PhotoMetadata) => void;
  /** Called when capture fails */
  onError?: (error: string) => void;
  /** Default category for captured photos */
  defaultCategory?: PhotoCategory;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom button size */
  size?: number;
  /** Custom colors */
  color?: string;
  backgroundColor?: string;
}

export function CaptureButton({
  onPhotoCapture,
  onError,
  defaultCategory = 'other',
  disabled = false,
  size = 64,
  color = '#FFFFFF',
  backgroundColor = '#007AFF',
}: CaptureButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handlePress = async () => {
    if (isCapturing || disabled) return;

    setIsCapturing(true);
    try {
      const result = await capturePhoto(defaultCategory);

      if (result.success && result.photo) {
        onPhotoCapture(result.photo);
      } else if (result.error) {
        onError?.(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Capture failed';
      onError?.(message);
    } finally {
      setIsCapturing(false);
    }
  };

  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: disabled ? '#999999' : backgroundColor,
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handlePress}
      disabled={disabled || isCapturing}
      activeOpacity={0.7}
      accessibilityLabel="Take photo"
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isCapturing }}
    >
      {isCapturing ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <View style={styles.iconContainer}>
          {/* Camera icon using shapes */}
          <View style={[styles.cameraBody, { borderColor: color }]}>
            <View style={[styles.cameraLens, { backgroundColor: color }]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Floating Action Button variant - positioned in bottom right
 */
export function FloatingCaptureButton(props: CaptureButtonProps) {
  return (
    <View style={styles.floatingContainer}>
      <CaptureButton {...props} />
    </View>
  );
}

/**
 * Mini capture button for inline use
 */
export function MiniCaptureButton(props: Omit<CaptureButtonProps, 'size'>) {
  return <CaptureButton {...props} size={44} />;
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBody: {
    width: 24,
    height: 18,
    borderWidth: 2,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
});

export default CaptureButton;
