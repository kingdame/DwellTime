/**
 * FacilityMapView - Interactive map view for facilities
 * Features: Clustered markers, user location, facility cards on select
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { palette, spacing, typography, radius, animation } from '@/shared/theme/tokens';
import { colors } from '@/constants/colors';
import { GlassCard } from '@/shared/components/ui';
import { AmenitiesCompact } from './AmenitiesDisplay';
import type { Id } from '../../../../convex/_generated/dataModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom map style for dark mode
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

// Marker color based on facility type
const getMarkerColor = (type: string) => {
  switch (type) {
    case 'shipper':
      return palette.dark.primary;
    case 'receiver':
      return palette.dark.warning;
    case 'both':
      return palette.dark.success;
    default:
      return palette.dark.textTertiary;
  }
};

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
  overnightParking?: boolean;
  restrooms?: boolean;
  driverLounge?: boolean;
  waterAvailable?: boolean;
  vendingMachines?: boolean;
  wifiAvailable?: boolean;
  showersAvailable?: boolean;
}

interface FacilityMapViewProps {
  facilities: Facility[];
  onFacilitySelect?: (facility: Facility) => void;
  initialRegion?: Region;
  showUserLocation?: boolean;
  style?: object;
}

export function FacilityMapView({
  facilities,
  onFacilitySelect,
  initialRegion,
  showUserLocation = true,
  style,
}: FacilityMapViewProps) {
  const theme = colors.dark;
  const mapRef = useRef<MapView>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Card animation
  const cardTranslateY = useSharedValue(200);
  const cardOpacity = useSharedValue(0);

  // Get user location
  useEffect(() => {
    if (showUserLocation) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      })();
    }
  }, [showUserLocation]);

  // Animate card when facility selected
  useEffect(() => {
    if (selectedFacility) {
      cardTranslateY.value = withSpring(0, animation.spring.bouncy);
      cardOpacity.value = withTiming(1, { duration: 200 });
    } else {
      cardTranslateY.value = withSpring(200, animation.spring.gentle);
      cardOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [selectedFacility, cardTranslateY, cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  const handleMarkerPress = useCallback((facility: Facility) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFacility(facility);

    // Center map on facility
    mapRef.current?.animateToRegion(
      {
        latitude: facility.lat,
        longitude: facility.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedFacility(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedFacility && onFacilitySelect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onFacilitySelect(selectedFacility);
    }
  }, [selectedFacility, onFacilitySelect]);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        300
      );
    }
  }, [userLocation]);

  // Default region: center of US or user location
  const defaultRegion: Region = initialRegion || {
    latitude: userLocation?.lat || 39.8283,
    longitude: userLocation?.lng || -98.5795,
    latitudeDelta: userLocation ? 0.1 : 30,
    longitudeDelta: userLocation ? 0.1 : 30,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={defaultRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleMapPress}
      >
        {facilities.map((facility) => (
          <Marker
            key={facility._id}
            coordinate={{ latitude: facility.lat, longitude: facility.lng }}
            onPress={() => handleMarkerPress(facility)}
            pinColor={getMarkerColor(facility.facilityType)}
          >
            <View style={[styles.marker, { borderColor: getMarkerColor(facility.facilityType) }]}>
              <Text style={styles.markerIcon}>
                {facility.facilityType === 'shipper'
                  ? '📤'
                  : facility.facilityType === 'receiver'
                  ? '📥'
                  : '🏢'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        {userLocation && (
          <Pressable style={styles.controlButton} onPress={handleCenterOnUser}>
            <Text style={styles.controlIcon}>📍</Text>
          </Pressable>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.primary }]} />
          <Text style={styles.legendText}>Shipper</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.warning }]} />
          <Text style={styles.legendText}>Receiver</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.dark.success }]} />
          <Text style={styles.legendText}>Both</Text>
        </View>
      </View>

      {/* Selected Facility Card */}
      {selectedFacility && (
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <GlassCard padding="lg" onPress={handleViewDetails}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {selectedFacility.name}
                </Text>
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {selectedFacility.city}, {selectedFacility.state}
                </Text>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>
                  {selectedFacility.facilityType === 'shipper'
                    ? 'Shipper'
                    : selectedFacility.facilityType === 'receiver'
                    ? 'Receiver'
                    : selectedFacility.facilityType === 'both'
                    ? 'Both'
                    : 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.cardStats}>
              {selectedFacility.avgRating && (
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>⭐ {selectedFacility.avgRating.toFixed(1)}</Text>
                  <Text style={styles.cardStatLabel}>{selectedFacility.totalReviews} reviews</Text>
                </View>
              )}
              {selectedFacility.avgWaitMinutes && (
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>⏱️ {selectedFacility.avgWaitMinutes}m</Text>
                  <Text style={styles.cardStatLabel}>avg wait</Text>
                </View>
              )}
            </View>

            <View style={styles.cardAmenities}>
              <AmenitiesCompact amenities={selectedFacility} />
            </View>

            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>Tap to view details →</Text>
            </View>
          </GlassCard>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.dark.card,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  controlIcon: {
    fontSize: 20,
  },
  legend: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    backgroundColor: palette.glass.backgroundSolid,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: palette.dark.textSecondary,
  },
  cardContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
  },
  cardAddress: {
    fontSize: typography.size.sm,
    color: palette.dark.textSecondary,
    marginTop: 2,
  },
  cardBadge: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: palette.dark.primaryMuted,
    borderRadius: radius.full,
  },
  cardBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: palette.dark.primary,
    textTransform: 'uppercase',
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  cardStat: {
    // Individual stat
  },
  cardStatValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  cardStatLabel: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
  },
  cardAmenities: {
    marginBottom: spacing.md,
    minHeight: 20,
  },
  cardAction: {
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: typography.size.sm,
    color: palette.dark.primary,
    fontWeight: typography.weight.medium,
  },
});
