/**
 * FacilityMapView - Web fallback (Map view not available on web)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { palette, spacing, typography, radius } from '@/shared/theme/tokens';
import { colors } from '@/constants/colors';
import { GlassCard } from '@/shared/components/ui';
import type { Id } from '../../../../convex/_generated/dataModel';

interface Facility {
  _id: Id<'facilities'>;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  lat: number;
  lng: number;
  facilityType: 'shipper' | 'receiver' | 'both' | 'unknown';
  avgRating?: number;
  avgWaitMinutes?: number;
  totalReviews: number;
}

interface FacilityMapViewProps {
  facilities: Facility[];
  onFacilitySelect?: (facility: Facility) => void;
  showUserLocation?: boolean;
  style?: object;
}

export function FacilityMapView({
  facilities,
  onFacilitySelect,
}: FacilityMapViewProps) {
  const theme = colors.dark;

  return (
    <View style={[styles.webFallback, { backgroundColor: theme.background }]}>
      <GlassCard padding="xl" style={styles.webFallbackCard}>
        <View style={styles.webFallbackContent}>
          <Text style={styles.webFallbackIcon}>🗺️</Text>
          <Text style={styles.webFallbackTitle}>Map View</Text>
          <Text style={styles.webFallbackText}>
            Interactive map is available on mobile devices.
          </Text>
          <Text style={styles.webFallbackSubtext}>
            {facilities.length} facilities in your area
          </Text>
        </View>
      </GlassCard>

      {/* Quick facility list */}
      {facilities.length > 0 && (
        <View style={styles.quickList}>
          <Text style={styles.quickListTitle}>Nearby Facilities</Text>
          {facilities.slice(0, 5).map((facility) => (
            <Pressable
              key={facility._id}
              style={styles.quickListItem}
              onPress={() => onFacilitySelect?.(facility)}
            >
              <View style={styles.quickListIcon}>
                <Text style={styles.quickListEmoji}>
                  {facility.facilityType === 'shipper'
                    ? '📤'
                    : facility.facilityType === 'receiver'
                    ? '📥'
                    : '🏢'}
                </Text>
              </View>
              <View style={styles.quickListInfo}>
                <Text style={styles.quickListName} numberOfLines={1}>
                  {facility.name}
                </Text>
                <Text style={styles.quickListLocation} numberOfLines={1}>
                  {facility.city}, {facility.state}
                </Text>
              </View>
              {facility.avgRating && (
                <Text style={styles.quickListRating}>⭐ {facility.avgRating.toFixed(1)}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    padding: spacing.xl,
  },
  webFallbackCard: {
    marginBottom: spacing.xl,
  },
  webFallbackContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  webFallbackIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  webFallbackTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  webFallbackText: {
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  webFallbackSubtext: {
    fontSize: typography.size.sm,
    color: palette.dark.primary,
  },
  quickList: {
    gap: spacing.sm,
  },
  quickListTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.sm,
  },
  quickListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.dark.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  quickListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickListEmoji: {
    fontSize: 20,
  },
  quickListInfo: {
    flex: 1,
  },
  quickListName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  quickListLocation: {
    fontSize: typography.size.sm,
    color: palette.dark.textSecondary,
  },
  quickListRating: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: '#FFD700',
  },
});
