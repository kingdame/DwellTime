/**
 * Facilities Tab - Facility lookup, saved facilities, and map view
 * Premium UI with glass-morphism design
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/constants/colors';
import {
  FacilityLookup,
  FacilitySearch,
  AddFacilityForm,
  FacilityMapView,
  FacilityDetailScreen,
  AmenitiesCompact,
} from '../../src/features/facilities';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';
import { useDetentionHistory, useNearbyFacilities } from '../../src/shared/hooks/convex';
import { GlassCard, StatusBadge } from '../../src/shared/components/ui';
import { spacing, typography, radius, palette } from '../../src/shared/theme/tokens';
import type { Id } from '../../convex/_generated/dataModel';

// View mode toggle
type ViewMode = 'list' | 'map';

// Facility type for display
interface DisplayFacility {
  _id: Id<'facilities'>;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
  facilityType: 'shipper' | 'receiver' | 'both' | 'unknown';
  avgRating?: number;
  avgWaitMinutes?: number;
  totalReviews: number;
  overnightParking?: boolean;
  restrooms?: boolean;
  driverLounge?: boolean;
  waterAvailable?: boolean;
  vendingMachines?: boolean;
  wifiAvailable?: boolean;
  showersAvailable?: boolean;
}

// Facility card component with glass design
function FacilityCard({
  facility,
  onPress,
  index,
}: {
  facility: DisplayFacility;
  onPress: () => void;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const typeLabel =
    facility.facilityType === 'both'
      ? 'Both'
      : facility.facilityType.charAt(0).toUpperCase() + facility.facilityType.slice(1);

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard padding="lg" onPress={onPress} style={styles.facilityCard}>
        <View style={styles.facilityCardHeader}>
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName} numberOfLines={1}>
              {facility.name}
            </Text>
            <Text style={styles.facilityAddress} numberOfLines={1}>
              {facility.city ? `${facility.city}, ` : ''}
              {facility.state || 'Unknown Location'}
            </Text>
          </View>
          <StatusBadge
            status={
              facility.facilityType === 'shipper'
                ? 'info'
                : facility.facilityType === 'receiver'
                ? 'warning'
                : 'neutral'
            }
            label={typeLabel}
            size="small"
            showDot={false}
            animated={false}
          />
        </View>

        <View style={styles.facilityStats}>
          {facility.avgRating !== undefined && facility.avgRating !== null && (
            <View style={styles.facilityStat}>
              <Text style={styles.facilityStatIcon}>⭐</Text>
              <Text style={styles.facilityStatValue}>{facility.avgRating.toFixed(1)}</Text>
            </View>
          )}
          {facility.avgWaitMinutes !== undefined && facility.avgWaitMinutes !== null && (
            <View style={styles.facilityStat}>
              <Text style={styles.facilityStatIcon}>⏱️</Text>
              <Text style={styles.facilityStatValue}>{facility.avgWaitMinutes}m</Text>
            </View>
          )}
          {facility.totalReviews > 0 && (
            <View style={styles.facilityStat}>
              <Text style={styles.facilityStatIcon}>📝</Text>
              <Text style={styles.facilityStatValue}>{facility.totalReviews}</Text>
            </View>
          )}
        </View>

        <View style={styles.facilityAmenities}>
          <AmenitiesCompact amenities={facility} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function FacilitiesTab() {
  const theme = colors.dark;
  const userId = useCurrentUserId() as Id<'users'> | undefined;
  const user = useCurrentUser();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showLookup, setShowLookup] = useState(false);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<DisplayFacility | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Header animation
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    headerTranslate.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [headerOpacity, headerTranslate]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  // Get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Get nearby facilities for map view
  const nearbyFacilities = useNearbyFacilities(
    currentLocation?.lat || 0,
    currentLocation?.lng || 0,
    50 // 50 mile radius
  );

  // Get recent facilities from detention history
  const detentionHistoryResult = useDetentionHistory(userId, { limit: 50 });

  // Extract unique recent facilities
  const recentFacilities: DisplayFacility[] = [];
  const seenFacilities = new Set<string>();

  if (detentionHistoryResult?.events) {
    for (const event of detentionHistoryResult.events) {
      if (event.facilityName && !seenFacilities.has(event.facilityName)) {
        seenFacilities.add(event.facilityName);
        recentFacilities.push({
          _id: (event.facilityId || event._id) as Id<'facilities'>,
          name: event.facilityName,
          address: '',
          city: '',
          state: '',
          zip: '',
          lat: 0,
          lng: 0,
          facilityType: event.eventType === 'pickup' ? 'shipper' : 'receiver',
          avgRating: undefined,
          avgWaitMinutes: undefined,
          totalReviews: 0,
        });
        if (recentFacilities.length >= 10) break;
      }
    }
  }

  const isLoadingRecent = detentionHistoryResult === undefined;

  // Handlers
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  }, []);

  const handleFacilitySelect = useCallback((facility: DisplayFacility) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFacility(facility);
  }, []);

  const handleSearchFacilitySelect = useCallback((facility: any) => {
    // Convert search result to DisplayFacility format
    // Handle both camelCase (new) and snake_case (legacy) property names
    const convertedFacility: DisplayFacility = {
      _id: (facility._id || facility.id) as Id<'facilities'>,
      name: facility.name,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zip: facility.zip,
      lat: facility.lat || 0,
      lng: facility.lng || 0,
      facilityType: facility.facilityType || facility.facility_type || 'unknown',
      avgRating: facility.avgRating ?? facility.avg_rating,
      avgWaitMinutes: facility.avgWaitMinutes ?? facility.avg_wait_minutes,
      totalReviews: facility.totalReviews || facility.total_reviews || 0,
      overnightParking: facility.overnightParking ?? facility.overnight_parking,
      restrooms: facility.restrooms,
      driverLounge: facility.driverLounge ?? facility.driver_lounge,
      waterAvailable: facility.waterAvailable ?? facility.water_available,
      vendingMachines: facility.vendingMachines ?? facility.vending_machines,
      wifiAvailable: facility.wifiAvailable ?? facility.wifi_available,
      showersAvailable: facility.showersAvailable ?? facility.showers_available,
    };
    handleFacilitySelect(convertedFacility);
  }, [handleFacilitySelect]);

  // If facility detail is selected, show detail screen
  if (selectedFacility) {
    return (
      <FacilityDetailScreen
        facility={selectedFacility}
        userId={userId}
        onBack={() => setSelectedFacility(null)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Facilities</Text>
            <Text style={styles.subtitle}>Check & save locations</Text>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => handleViewModeChange('list')}
            >
              <Text
                style={[styles.toggleIcon, viewMode === 'list' && styles.toggleIconActive]}
              >
                📋
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => handleViewModeChange('map')}
            >
              <Text
                style={[styles.toggleIcon, viewMode === 'map' && styles.toggleIconActive]}
              >
                🗺️
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {viewMode === 'list' ? (
        // List View
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassCard
              padding="lg"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowLookup(true);
              }}
            >
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonIcon}>🔍</Text>
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Check Facility</Text>
                  <Text style={styles.actionButtonSubtitle}>Look up before accepting a load</Text>
                </View>
              </View>
            </GlassCard>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddFacility(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>+ Add New Facility</Text>
            </Pressable>
          </View>

          {/* Quick Search */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Quick Search</Text>
            <FacilitySearch
              onSelect={handleSearchFacilitySelect}
              currentLocation={currentLocation}
              userId={userId}
              placeholder="Search facilities or addresses..."
            />
          </View>

          {/* Recent Facilities */}
          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>Recently Visited</Text>

            {isLoadingRecent ? (
              <GlassCard padding="xl">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading recent facilities...</Text>
                </View>
              </GlassCard>
            ) : recentFacilities.length > 0 ? (
              <View style={styles.facilityList}>
                {recentFacilities.map((facility, index) => (
                  <FacilityCard
                    key={facility._id}
                    facility={facility}
                    onPress={() => handleFacilitySelect(facility)}
                    index={index}
                  />
                ))}
              </View>
            ) : (
              <GlassCard padding="xl">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🏢</Text>
                  <Text style={styles.emptyText}>No recent facilities</Text>
                  <Text style={styles.emptySubtext}>
                    Track detention at facilities to see them here
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        // Map View
        <View style={styles.mapContainer}>
          <FacilityMapView
            facilities={(nearbyFacilities || []) as DisplayFacility[]}
            onFacilitySelect={handleFacilitySelect}
            showUserLocation={true}
          />
        </View>
      )}

      {/* Facility Lookup Modal */}
      <Modal
        visible={showLookup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLookup(false)}
      >
        <FacilityLookup onClose={() => setShowLookup(false)} />
      </Modal>

      {/* Add Facility Modal */}
      <Modal
        visible={showAddFacility}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddFacility(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <AddFacilityForm
            currentLocation={currentLocation}
            onSuccess={(facility) => {
              setShowAddFacility(false);
              console.log('Created facility:', facility);
            }}
            onCancel={() => setShowAddFacility(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
    letterSpacing: typography.tracking.tight,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
    marginTop: spacing.xxs,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: palette.dark.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.xxs,
  },
  toggleButton: {
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  toggleButtonActive: {
    backgroundColor: palette.dark.card,
  },
  toggleIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  toggleIconActive: {
    opacity: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButtonIcon: {
    fontSize: 32,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
  },
  actionButtonSubtitle: {
    fontSize: typography.size.sm,
    color: palette.dark.textSecondary,
    marginTop: 2,
  },
  secondaryButton: {
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.dark.primary,
  },
  secondaryButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: palette.dark.primary,
  },
  section: {
    marginBottom: spacing.xl,
    zIndex: 1,
  },
  searchSection: {
    marginBottom: spacing.xl,
    zIndex: 99999,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.md,
  },
  facilityList: {
    gap: spacing.md,
  },
  facilityCard: {
    marginBottom: 0,
  },
  facilityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  facilityInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  facilityName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  facilityAddress: {
    fontSize: typography.size.sm,
    color: palette.dark.textSecondary,
    marginTop: 2,
  },
  facilityStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  facilityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  facilityStatIcon: {
    fontSize: 14,
  },
  facilityStatValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: palette.dark.textPrimary,
  },
  facilityAmenities: {
    minHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: palette.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: palette.dark.textTertiary,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.xl,
  },
});
