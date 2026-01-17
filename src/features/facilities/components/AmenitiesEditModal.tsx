/**
 * AmenitiesEditModal - Driver updates for facility amenities
 * Features: Toggle switches, glass-morphism design, animated transitions
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { palette, spacing, typography, radius, animation } from '@/shared/theme/tokens';
import { colors } from '@/constants/colors';
import { GlassCard } from '@/shared/components/ui';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

// Amenity definitions
const AMENITY_CONFIG = {
  overnightParking: { icon: '🌙', label: 'Overnight Parking', description: 'Safe parking available overnight' },
  restrooms: { icon: '🚻', label: 'Restrooms', description: 'Accessible restroom facilities' },
  driverLounge: { icon: '🛋️', label: 'Driver Lounge', description: 'Rest area for drivers' },
  waterAvailable: { icon: '💧', label: 'Water Available', description: 'Free water access' },
  vendingMachines: { icon: '🍫', label: 'Vending Machines', description: 'Snacks and drinks' },
  wifiAvailable: { icon: '📶', label: 'WiFi', description: 'Free WiFi access' },
  showersAvailable: { icon: '🚿', label: 'Showers', description: 'Shower facilities' },
} as const;

type AmenityKey = keyof typeof AMENITY_CONFIG;

// Toggle row component
interface AmenityToggleProps {
  amenityKey: AmenityKey;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

function AmenityToggle({ amenityKey, value, onChange }: AmenityToggleProps) {
  const config = AMENITY_CONFIG[amenityKey];
  const theme = colors.dark;

  const handleToggle = (newValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(newValue);
  };

  const handleUnknown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(null);
  };

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleIcon}>{config.icon}</Text>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>{config.label}</Text>
          <Text style={styles.toggleDescription}>{config.description}</Text>
        </View>
      </View>
      <View style={styles.toggleControls}>
        {value !== null ? (
          <Switch
            value={value}
            onValueChange={handleToggle}
            trackColor={{ false: palette.dark.backgroundSecondary, true: palette.dark.success }}
            thumbColor="#fff"
            ios_backgroundColor={palette.dark.backgroundSecondary}
          />
        ) : (
          <View style={styles.unknownState}>
            <Pressable
              style={[styles.unknownButton, styles.yesButton]}
              onPress={() => handleToggle(true)}
            >
              <Text style={styles.yesButtonText}>Yes</Text>
            </Pressable>
            <Pressable
              style={[styles.unknownButton, styles.noButton]}
              onPress={() => handleToggle(false)}
            >
              <Text style={styles.noButtonText}>No</Text>
            </Pressable>
          </View>
        )}
        {value !== null && (
          <Pressable style={styles.resetButton} onPress={handleUnknown}>
            <Text style={styles.resetButtonText}>?</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

interface FacilityAmenities {
  overnightParking?: boolean | null;
  parkingSpaces?: number | null;
  restrooms?: boolean | null;
  driverLounge?: boolean | null;
  waterAvailable?: boolean | null;
  vendingMachines?: boolean | null;
  wifiAvailable?: boolean | null;
  showersAvailable?: boolean | null;
}

interface AmenitiesEditModalProps {
  visible: boolean;
  onClose: () => void;
  facilityId: Id<'facilities'>;
  facilityName: string;
  currentAmenities: FacilityAmenities;
  onSaveSuccess?: () => void;
}

export function AmenitiesEditModal({
  visible,
  onClose,
  facilityId,
  facilityName,
  currentAmenities,
  onSaveSuccess,
}: AmenitiesEditModalProps) {
  const theme = colors.dark;
  const updateFacility = useMutation(api.facilities.update);

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  // Form state
  const [amenities, setAmenities] = useState<FacilityAmenities>(currentAmenities);
  const [parkingSpaces, setParkingSpaces] = useState(
    currentAmenities.parkingSpaces?.toString() || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setAmenities(currentAmenities);
      setParkingSpaces(currentAmenities.parkingSpaces?.toString() || '');
    }
  }, [visible, currentAmenities]);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
      modalScale.value = withSpring(1, animation.spring.bouncy);
      modalOpacity.value = withTiming(1, { duration: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, backdropOpacity, modalScale, modalOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const handleAmenityChange = useCallback((key: AmenityKey, value: boolean | null) => {
    setAmenities((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateFacility({
        id: facilityId,
        overnightParking: amenities.overnightParking ?? undefined,
        restrooms: amenities.restrooms ?? undefined,
        driverLounge: amenities.driverLounge ?? undefined,
        waterAvailable: amenities.waterAvailable ?? undefined,
        vendingMachines: amenities.vendingMachines ?? undefined,
        wifiAvailable: amenities.wifiAvailable ?? undefined,
        showersAvailable: amenities.showersAvailable ?? undefined,
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces, 10) : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaveSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update amenities:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [amenities, parkingSpaces, facilityId, updateFacility, onSaveSuccess, onClose]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <GlassCard padding="xxl" style={styles.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Update Amenities</Text>
                <Text style={styles.facilityName} numberOfLines={2}>
                  {facilityName}
                </Text>
                <Text style={styles.helperText}>
                  Help other drivers by reporting available amenities
                </Text>
              </View>

              {/* Parking Spaces */}
              <View style={styles.parkingSection}>
                <View style={styles.parkingHeader}>
                  <Text style={styles.parkingIcon}>🚛</Text>
                  <Text style={styles.parkingLabel}>Truck Parking Spaces</Text>
                </View>
                <TextInput
                  style={[styles.parkingInput, { backgroundColor: theme.backgroundSecondary }]}
                  value={parkingSpaces}
                  onChangeText={setParkingSpaces}
                  placeholder="Number of spaces"
                  placeholderTextColor={theme.textDisabled}
                  keyboardType="number-pad"
                />
              </View>

              {/* Amenity Toggles */}
              <View style={styles.togglesSection}>
                {(Object.keys(AMENITY_CONFIG) as AmenityKey[]).map((key) => (
                  <AmenityToggle
                    key={key}
                    amenityKey={key}
                    value={amenities[key] ?? null}
                    onChange={(value) => handleAmenityChange(key, value)}
                  />
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.buttonText, styles.submitButtonText]}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.dark.overlay,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '90%',
  },
  modal: {
    // GlassCard handles styling
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  facilityName: {
    fontSize: typography.size.lg,
    color: palette.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.size.sm,
    color: palette.dark.textTertiary,
  },
  parkingSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: palette.dark.divider,
  },
  parkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  parkingIcon: {
    fontSize: 24,
  },
  parkingLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  parkingInput: {
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: typography.size.lg,
    color: palette.dark.textPrimary,
    borderWidth: 1,
    borderColor: palette.dark.divider,
    textAlign: 'center',
  },
  togglesSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.dark.dividerLight,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  toggleIcon: {
    fontSize: 24,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: palette.dark.textPrimary,
  },
  toggleDescription: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
    marginTop: 2,
  },
  toggleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unknownState: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  unknownButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  yesButton: {
    backgroundColor: palette.dark.successMuted,
  },
  yesButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.success,
  },
  noButton: {
    backgroundColor: palette.dark.errorMuted,
  },
  noButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.error,
  },
  resetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: palette.dark.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: palette.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: palette.dark.divider,
  },
  submitButton: {
    backgroundColor: palette.dark.primary,
  },
  buttonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  cancelButtonText: {
    color: palette.dark.textSecondary,
  },
  submitButtonText: {
    color: '#fff',
  },
});
