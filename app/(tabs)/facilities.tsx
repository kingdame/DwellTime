/**
 * Facilities Tab - Facility lookup and saved facilities
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '../../src/constants/colors';
import { FacilityLookup, FacilitySearch, AddFacilityForm } from '../../src/features/facilities';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';
import { useDetentionHistory } from '../../src/shared/hooks/convex';
import type { Facility } from '../../src/shared/types';
import type { Id } from '../../convex/_generated/dataModel';

function SavedFacilityCard({ facility }: { facility: Facility }) {
  const theme = colors.dark;

  return (
    <View style={[styles.facilityCard, { backgroundColor: theme.card }]}>
      <View style={styles.facilityCardContent}>
        <Text style={[styles.facilityName, { color: theme.textPrimary }]} numberOfLines={1}>
          {facility.name}
        </Text>
        <Text style={[styles.facilityAddress, { color: theme.textSecondary }]} numberOfLines={1}>
          {facility.city ? `${facility.city}, ` : ''}
          {facility.state || ''}
        </Text>
        <View style={styles.facilityMeta}>
          {facility.avg_rating !== null && (
            <Text style={[styles.facilityRating, { color: theme.warning }]}>
              ⭐ {facility.avg_rating.toFixed(1)}
            </Text>
          )}
          <Text style={[styles.facilityType, { color: theme.textDisabled }]}>
            {facility.facility_type === 'both'
              ? 'Shipper/Receiver'
              : facility.facility_type.charAt(0).toUpperCase() + facility.facility_type.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function FacilitiesTab() {
  const theme = colors.dark;
  const userId = useCurrentUserId() as Id<"users"> | undefined;
  const user = useCurrentUser();
  const [showLookup, setShowLookup] = useState(false);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get current location for adding facilities
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

  // Get recent facilities from detention history (last 10 unique facilities)
  const detentionHistoryResult = useDetentionHistory(userId, { limit: 50 });
  
  // Extract unique recent facilities from detention events
  const recentFacilities: Facility[] = [];
  const seenFacilities = new Set<string>();
  
  if (detentionHistoryResult?.events) {
    for (const event of detentionHistoryResult.events) {
      if (event.facilityName && !seenFacilities.has(event.facilityName)) {
        seenFacilities.add(event.facilityName);
        recentFacilities.push({
          id: event.facilityId || event._id,
          name: event.facilityName,
          address: '',
          city: '',
          state: '',
          zip: '',
          lat: 0,
          lng: 0,
          facility_type: event.eventType === 'pickup' ? 'shipper' : 'receiver',
          avg_wait_minutes: null,
          avg_rating: null,
          total_reviews: 0,
          overnight_parking: null,
          parking_spaces: null,
          restrooms: null,
          driver_lounge: null,
          water_available: null,
          vending_machines: null,
          wifi_available: null,
          showers_available: null,
          created_at: '',
          updated_at: '',
        });
        if (recentFacilities.length >= 10) break;
      }
    }
  }
  
  const isLoadingRecent = detentionHistoryResult === undefined;

  const handleFacilitySelect = (facility: Facility) => {
    console.log('Selected facility:', facility.id);
    // Could navigate to facility detail or start tracking
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Facilities</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Check & save locations
        </Text>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowLookup(true)}
        >
          <Text style={styles.primaryButtonIcon}>🔍</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.primaryButtonText}>Check Facility</Text>
            <Text style={styles.primaryButtonSubtext}>
              Look up before accepting a load
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, { borderColor: theme.primary }]}
          onPress={() => setShowAddFacility(true)}
        >
          <Text style={styles.secondaryButtonText}>+ Add New Facility</Text>
        </Pressable>
      </View>

      {/* Quick Search */}
      <View style={styles.searchSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quick Search</Text>
        <FacilitySearch
          onSelect={handleFacilitySelect}
          userId={userId}
          placeholder="Search facilities..."
        />
      </View>

      {/* Recent Facilities */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Recently Visited
        </Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {isLoadingRecent ? (
            <View style={[styles.loadingState, { backgroundColor: theme.card }]}>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading recent facilities...
              </Text>
            </View>
          ) : recentFacilities && recentFacilities.length > 0 ? (
            <>
              {recentFacilities.map((facility) => (
                <SavedFacilityCard key={facility.id} facility={facility} />
              ))}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No recent facilities
              </Text>
              <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
                Track detention at facilities to see them here
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

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
              // Could show a success message or navigate to facility
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
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  primaryButtonIcon: {
    fontSize: 32,
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  secondaryButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listSection: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  facilityCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  facilityCardContent: {
    gap: 4,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  facilityAddress: {
    fontSize: 13,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  facilityRating: {
    fontSize: 12,
    fontWeight: '500',
  },
  facilityType: {
    fontSize: 12,
  },
  loadingState: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    padding: 8,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
  },
});
