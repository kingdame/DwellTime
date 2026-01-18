/**
 * FacilitySearch Component
 * Combined search: Our facilities database + Google Places
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useSearchFacilities } from '../hooks/useFacilitiesConvex';
import { searchPlaces, getPlaceDetails, isGoogleMapsConfigured, type PlacePrediction } from '@/shared/lib/googleMaps';
import type { Facility } from '@/shared/types';
import { spacing, typography, radius, palette } from '@/shared/theme/tokens';

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
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

// Result type enum
type ResultType = 'database' | 'google';

interface SearchResult {
  type: ResultType;
  facility?: Facility;
  prediction?: PlacePrediction;
  name: string;
  subtitle: string;
  distance?: number;
}

export function FacilitySearch({
  onSelect,
  currentLocation,
  userId,
  placeholder = 'Search facilities or addresses...',
}: FacilitySearchProps) {
  const theme = colors.dark;
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleResults, setGoogleResults] = useState<PlacePrediction[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search our database
  const searchResults = useSearchFacilities(query.length >= 2 ? query : undefined);
  const isSearchingDb = searchResults === undefined && query.length >= 2;

  // Check if Google is configured
  const googleConfigured = isGoogleMapsConfigured();

  // Debounced Google search
  useEffect(() => {
    if (!googleConfigured || query.length < 2) {
      setGoogleResults([]);
      setIsLoadingGoogle(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsLoadingGoogle(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query, {
          location: currentLocation || undefined,
        });
        setGoogleResults(results);
      } catch (error) {
        console.error('Google Places search error:', error);
        setGoogleResults([]);
      } finally {
        setIsLoadingGoogle(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, currentLocation, googleConfigured]);

  // Handle facility from database selection
  const handleDbSelect = useCallback((facility: Facility) => {
    setQuery('');
    setIsFocused(false);
    Keyboard.dismiss();
    onSelect(facility);
  }, [onSelect]);

  // Handle Google place selection
  const handleGoogleSelect = useCallback(async (prediction: PlacePrediction) => {
    setQuery(prediction.structured_formatting.main_text);
    setIsFocused(false);
    Keyboard.dismiss();

    try {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        // Convert Google result to Facility format
        const facility: Facility = {
          id: `google-${prediction.place_id}`,
          name: details.name || prediction.structured_formatting.main_text,
          address: details.streetAddress || details.formattedAddress,
          city: details.city,
          state: details.state,
          zip: details.postalCode,
          lat: details.lat,
          lng: details.lng,
          facilityType: 'unknown',
          avgWaitMinutes: null,
          avgRating: null,
          totalReviews: 0,
          overnightParking: null,
          parkingSpaces: null,
          restrooms: null,
          driverLounge: null,
          waterAvailable: null,
          vendingMachines: null,
          wifiAvailable: null,
          showersAvailable: null,
        };
        onSelect(facility);
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
  }, [onSelect]);

  const showResults = isFocused && query.length >= 2;
  const isLoading = isSearchingDb || isLoadingGoogle;

  // Combine results
  const combinedResults: SearchResult[] = [];

  // Add database results first
  if (searchResults && searchResults.length > 0) {
    for (const facility of searchResults) {
      combinedResults.push({
        type: 'database',
        facility,
        name: facility.name,
        subtitle: facility.city && facility.state 
          ? `${facility.city}, ${facility.state}` 
          : facility.address || 'Unknown location',
        distance: (facility as any).distance,
      });
    }
  }

  // Add Google results
  for (const prediction of googleResults) {
    // Skip if we already have this place from database
    const isDuplicate = combinedResults.some(r => 
      r.name.toLowerCase() === prediction.structured_formatting.main_text.toLowerCase()
    );
    if (!isDuplicate) {
      combinedResults.push({
        type: 'google',
        prediction,
        name: prediction.structured_formatting.main_text,
        subtitle: prediction.structured_formatting.secondary_text || '',
      });
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
        {isLoading && (
          <ActivityIndicator size="small" color={theme.primary} />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={[styles.clearButton, { color: theme.textSecondary }]}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Dropdown */}
      {showResults && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.card }]}>
          {combinedResults.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {googleConfigured 
                  ? 'No facilities found. Try a different search.'
                  : 'No facilities found in database.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={combinedResults}
              keyExtractor={(item, index) => 
                item.type === 'database' 
                  ? `db-${item.facility?.id}` 
                  : `google-${item.prediction?.place_id || index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => {
                    if (item.type === 'database' && item.facility) {
                      handleDbSelect(item.facility);
                    } else if (item.type === 'google' && item.prediction) {
                      handleGoogleSelect(item.prediction);
                    }
                  }}
                >
                  <View style={styles.resultContent}>
                    <View style={styles.resultHeader}>
                      <Text style={[styles.resultName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.type === 'database' && (
                        <View style={[styles.sourceBadge, { backgroundColor: palette.dark.primaryMuted }]}>
                          <Text style={[styles.sourceBadgeText, { color: palette.dark.primary }]}>
                            Saved
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                    {item.type === 'database' && item.facility && (
                      <View style={styles.facilityMeta}>
                        <Text style={[styles.facilityType, { color: theme.textDisabled }]}>
                          {item.facility.facilityType === 'both' 
                            ? 'Shipper/Receiver' 
                            : item.facility.facilityType || 'Unknown'}
                        </Text>
                        {item.facility.avgRating !== null && (
                          <Text style={[styles.rating, { color: theme.warning }]}>
                            ⭐ {item.facility.avgRating?.toFixed(1)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {item.distance !== undefined && (
                    <View style={styles.distanceBadge}>
                      <Text style={[styles.distanceText, { color: theme.primary }]}>
                        {formatDistance(item.distance)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: theme.divider }]} />
              )}
            />
          )}
          {googleConfigured && (
            <View style={[styles.poweredBy, { borderTopColor: theme.divider }]}>
              <Text style={[styles.poweredByText, { color: theme.textDisabled }]}>
                Powered by Google
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 99999,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    height: '100%',
  },
  clearButton: {
    fontSize: 24,
    fontWeight: '300',
    paddingHorizontal: spacing.sm,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 350,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 999,
    zIndex: 99999,
    overflow: 'visible',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  list: {
    maxHeight: 300,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    flex: 1,
  },
  sourceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  sourceBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  resultSubtitle: {
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  facilityType: {
    fontSize: typography.size.xs,
    textTransform: 'capitalize',
  },
  rating: {
    fontSize: typography.size.xs,
  },
  distanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    marginLeft: spacing.sm,
  },
  distanceText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  separator: {
    height: 1,
    marginLeft: spacing.lg,
  },
  poweredBy: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  poweredByText: {
    fontSize: 10,
  },
});
