/**
 * AmenitiesDisplay - Premium amenities grid with icons
 * Features: Animated icons, glass-morphism badges, status indicators
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { palette, spacing, typography, radius, animation } from '@/shared/theme/tokens';

// Amenity definitions with icons and labels
const AMENITY_CONFIG = {
  overnightParking: { icon: '🌙', label: 'Overnight Parking' },
  restrooms: { icon: '🚻', label: 'Restrooms' },
  driverLounge: { icon: '🛋️', label: 'Driver Lounge' },
  waterAvailable: { icon: '💧', label: 'Water' },
  vendingMachines: { icon: '🍫', label: 'Vending' },
  wifiAvailable: { icon: '📶', label: 'WiFi' },
  showersAvailable: { icon: '🚿', label: 'Showers' },
} as const;

type AmenityKey = keyof typeof AMENITY_CONFIG;

interface AmenityBadgeProps {
  amenityKey: AmenityKey;
  available: boolean | null | undefined;
  index: number;
  size?: 'small' | 'medium' | 'large';
}

function AmenityBadge({ amenityKey, available, index, size = 'medium' }: AmenityBadgeProps) {
  const config = AMENITY_CONFIG[amenityKey];
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1, animation.spring.bouncy));
    opacity.value = withDelay(index * 50, withSpring(1, { damping: 20, stiffness: 200 }));
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Determine status
  const isAvailable = available === true;
  const isUnknown = available === null || available === undefined;

  const sizeStyles = {
    small: { icon: 16, padding: spacing.sm, label: typography.size.xs },
    medium: { icon: 20, padding: spacing.md, label: typography.size.sm },
    large: { icon: 24, padding: spacing.lg, label: typography.size.md },
  };

  const sizeConfig = sizeStyles[size];

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: isUnknown
            ? palette.dark.backgroundSecondary
            : isAvailable
            ? palette.dark.successMuted
            : palette.dark.errorMuted,
          borderColor: isUnknown
            ? palette.dark.divider
            : isAvailable
            ? palette.dark.success
            : palette.dark.error,
          paddingVertical: sizeConfig.padding,
          paddingHorizontal: sizeConfig.padding + 4,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.icon, { fontSize: sizeConfig.icon }]}>{config.icon}</Text>
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeConfig.label,
            color: isUnknown
              ? palette.dark.textTertiary
              : isAvailable
              ? palette.dark.success
              : palette.dark.error,
          },
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
      {!isUnknown && (
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isAvailable ? palette.dark.success : palette.dark.error },
          ]}
        />
      )}
    </Animated.View>
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

interface AmenitiesDisplayProps {
  amenities: FacilityAmenities;
  showUnknown?: boolean;
  size?: 'small' | 'medium' | 'large';
  onEditPress?: () => void;
  style?: object;
}

export function AmenitiesDisplay({
  amenities,
  showUnknown = false,
  size = 'medium',
  onEditPress,
  style,
}: AmenitiesDisplayProps) {
  const amenityKeys = Object.keys(AMENITY_CONFIG) as AmenityKey[];

  // Filter amenities based on showUnknown
  const displayedAmenities = amenityKeys.filter((key) => {
    const value = amenities[key];
    if (showUnknown) return true;
    return value !== null && value !== undefined;
  });

  if (displayedAmenities.length === 0 && !showUnknown) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyIcon}>❓</Text>
        <Text style={styles.emptyText}>No amenity information yet</Text>
        {onEditPress && (
          <Pressable style={styles.addButton} onPress={onEditPress}>
            <Text style={styles.addButtonText}>+ Add Amenities</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Amenities</Text>
        {onEditPress && (
          <Pressable style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonText}>✏️ Update</Text>
          </Pressable>
        )}
      </View>

      {/* Parking spaces special display */}
      {amenities.parkingSpaces !== null && amenities.parkingSpaces !== undefined && (
        <View style={styles.parkingRow}>
          <Text style={styles.parkingIcon}>🚛</Text>
          <Text style={styles.parkingText}>
            {amenities.parkingSpaces} Parking Spaces
          </Text>
        </View>
      )}

      {/* Amenities grid */}
      <View style={styles.grid}>
        {displayedAmenities.map((key, index) => (
          <AmenityBadge
            key={key}
            amenityKey={key}
            available={amenities[key]}
            index={index}
            size={size}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.success }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.error }]} />
          <Text style={styles.legendText}>Not Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.textTertiary }]} />
          <Text style={styles.legendText}>Unknown</Text>
        </View>
      </View>
    </View>
  );
}

// Compact variant for cards
export function AmenitiesCompact({ amenities }: { amenities: FacilityAmenities }) {
  const availableAmenities = (Object.keys(AMENITY_CONFIG) as AmenityKey[]).filter(
    (key) => amenities[key] === true
  );

  if (availableAmenities.length === 0) {
    return null;
  }

  return (
    <View style={styles.compactContainer}>
      {availableAmenities.slice(0, 5).map((key, index) => (
        <Text key={key} style={styles.compactIcon}>
          {AMENITY_CONFIG[key].icon}
        </Text>
      ))}
      {availableAmenities.length > 5 && (
        <Text style={styles.compactMore}>+{availableAmenities.length - 5}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Main container
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  editButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.dark.primaryMuted,
    borderRadius: radius.full,
  },
  editButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: palette.dark.primary,
  },
  parkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.dark.backgroundSecondary,
    borderRadius: radius.md,
  },
  parkingIcon: {
    fontSize: 20,
  },
  parkingText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: palette.dark.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  icon: {
    // Font size set dynamically
  },
  label: {
    fontWeight: typography.weight.medium,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.xxs,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.dark.dividerLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
    marginBottom: spacing.md,
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.dark.primaryMuted,
    borderRadius: radius.full,
  },
  addButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.primary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  compactIcon: {
    fontSize: 14,
  },
  compactMore: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
    marginLeft: spacing.xxs,
  },
});
