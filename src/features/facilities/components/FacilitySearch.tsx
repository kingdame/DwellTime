/**
 * FacilitySearch Component
 * Search and select facilities with autocomplete
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useFacilitySearch, useNearbyFacilities, useRecentFacilities } from '../hooks/useFacilities';
import type { Facility } from '@/shared/types';
import type { NearbyFacility } from '../services/facilityService';

interface FacilitySearchProps {
  onSelect: (facility: Facility) => void;
  currentLocation?: { lat: number; lng: number } | null;
  userId?: string | null;
  placeholder?: string;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function FacilityRow({
  facility,
  distance,
  onPress,
}: {
  facility: Facility;
  distance?: number;
  onPress: () => void;
}) {
  const theme = colors.dark;

  return (
    <TouchableOpacity
      style={[styles.facilityRow, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.facilityInfo}>
        <Text style={[styles.facilityName, { color: theme.textPrimary }]} numberOfLines={1}>
          {facility.name}
        </Text>
        {facility.address && (
          <Text style={[styles.facilityAddress, { color: theme.textSecondary }]} numberOfLines={1}>
            {facility.address}
            {facility.city ? `, ${facility.city}` : ''}
            {facility.state ? `, ${facility.state}` : ''}
          </Text>
        )}
        <View style={styles.facilityMeta}>
          <Text style={[styles.facilityType, { color: theme.textDisabled }]}>
            {facility.facility_type === 'both' ? 'Shipper/Receiver' : facility.facility_type}
          </Text>
          {facility.avg_rating !== null && (
            <Text style={[styles.rating, { color: theme.warning }]}>
              {' '}• {facility.avg_rating.toFixed(1)} ({facility.total_reviews})
            </Text>
          )}
        </View>
      </View>
      {distance !== undefined && (
        <View style={styles.distanceBadge}>
          <Text style={[styles.distanceText, { color: theme.primary }]}>
            {formatDistance(distance)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function FacilitySearch({
  onSelect,
  currentLocation,
  userId,
  placeholder = 'Search facilities...',
}: FacilitySearchProps) {
  const theme = colors.dark;
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Search query
  const {
    data: searchResults,
    isLoading: isSearching,
  } = useFacilitySearch(query, query.length >= 2);

  // Nearby facilities
  const {
    data: nearbyFacilities,
    isLoading: isLoadingNearby,
  } = useNearbyFacilities(
    currentLocation?.lat ?? null,
    currentLocation?.lng ?? null,
    5000,
    10
  );

  // Recent facilities
  const {
    data: recentFacilities,
    isLoading: isLoadingRecent,
  } = useRecentFacilities(userId ?? null, 5);

  const handleSelect = useCallback((facility: Facility) => {
    setQuery('');
    setIsFocused(false);
    onSelect(facility);
  }, [onSelect]);

  const showResults = isFocused || query.length >= 2;
  const isSearchMode = query.length >= 2;

  // Determine what to display
  let displayData: (Facility | NearbyFacility)[] = [];
  let sectionTitle = '';
  let isLoading = false;

  if (isSearchMode) {
    displayData = searchResults || [];
    sectionTitle = searchResults?.length ? 'Search Results' : '';
    isLoading = isSearching;
  } else if (showResults) {
    // Show nearby first, then recent
    if (nearbyFacilities?.length) {
      displayData = nearbyFacilities;
      sectionTitle = 'Nearby';
      isLoading = isLoadingNearby;
    } else if (recentFacilities?.length) {
      displayData = recentFacilities;
      sectionTitle = 'Recent';
      isLoading = isLoadingRecent;
    }
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          placeholderTextColor={theme.textDisabled}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={[styles.clearButton, { color: theme.textSecondary }]}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Dropdown */}
      {showResults && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.background }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Searching...
              </Text>
            </View>
          ) : displayData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {isSearchMode
                  ? 'No facilities found'
                  : currentLocation
                  ? 'No nearby facilities'
                  : 'Type to search facilities'}
              </Text>
            </View>
          ) : (
            <>
              {sectionTitle && (
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  {sectionTitle}
                </Text>
              )}
              <FlatList
                data={displayData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <FacilityRow
                    facility={item}
                    distance={'distance' in item ? item.distance : undefined}
                    onPress={() => handleSelect(item)}
                  />
                )}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    fontSize: 24,
    fontWeight: '300',
    paddingHorizontal: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  list: {
    maxHeight: 250,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  facilityAddress: {
    fontSize: 13,
    marginBottom: 4,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  rating: {
    fontSize: 12,
  },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
