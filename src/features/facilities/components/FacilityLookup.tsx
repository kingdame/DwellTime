/**
 * FacilityLookup Component
 * Full-screen facility lookup for pre-load checking
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
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useFacilitySearch, usePopularFacilities } from '../hooks/useFacilities';
import { useFacilityWithReviews } from '../hooks/useFacilityLookup';
import type { Facility } from '@/shared/types';
import { FacilityPreviewCard } from './FacilityPreviewCard';

interface FacilityLookupProps {
  onClose?: () => void;
}

function FacilityListItem({
  facility,
  onPress,
  isSelected,
}: {
  facility: Facility;
  onPress: () => void;
  isSelected: boolean;
}) {
  const theme = colors.dark;

  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        { backgroundColor: isSelected ? theme.primary + '20' : theme.card },
        isSelected && { borderColor: theme.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemName, { color: theme.textPrimary }]} numberOfLines={1}>
          {facility.name}
        </Text>
        {facility.address && (
          <Text style={[styles.listItemAddress, { color: theme.textSecondary }]} numberOfLines={1}>
            {facility.city ? `${facility.city}, ` : ''}
            {facility.state || ''}
          </Text>
        )}
        <View style={styles.listItemMeta}>
          {facility.avg_rating !== null && (
            <Text style={[styles.listItemRating, { color: theme.warning }]}>
              ⭐ {facility.avg_rating.toFixed(1)}
            </Text>
          )}
          {facility.total_reviews > 0 && (
            <Text style={[styles.listItemReviews, { color: theme.textDisabled }]}>
              ({facility.total_reviews})
            </Text>
          )}
          <Text style={[styles.listItemType, { color: theme.textDisabled }]}>
            {facility.facility_type === 'both' ? 'S/R' : facility.facility_type.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}

export function FacilityLookup({ onClose }: FacilityLookupProps) {
  const theme = colors.dark;
  const [query, setQuery] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Search query
  const { data: searchResults, isLoading: isSearching } = useFacilitySearch(
    query,
    query.length >= 2
  );

  // Popular facilities when not searching
  const { data: popularFacilities, isLoading: isLoadingPopular } = usePopularFacilities(10);

  // Selected facility with reviews
  const { data: facilityData, isLoading: isLoadingDetails } = useFacilityWithReviews(
    selectedFacilityId
  );

  const handleSelectFacility = useCallback((facility: Facility) => {
    setSelectedFacilityId(facility.id);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedFacilityId(null);
  }, []);

  const handleGetDirections = useCallback(() => {
    if (!facilityData?.facility) return;

    const { lat, lng, name, address, city, state } = facilityData.facility;
    const destination = encodeURIComponent(
      address ? `${address}, ${city || ''}, ${state || ''}` : name
    );

    // Try to open in navigation app
    const urls = Platform.select({
      ios: [
        `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
        `maps://?daddr=${lat},${lng}`,
      ],
      android: [
        `google.navigation:q=${lat},${lng}`,
        `geo:${lat},${lng}?q=${destination}`,
      ],
      default: [`https://www.google.com/maps/dir/?api=1&destination=${destination}`],
    });

    // Try first URL, fall back to web
    if (urls && urls.length > 0) {
      Linking.canOpenURL(urls[0]).then((supported) => {
        if (supported) {
          Linking.openURL(urls[0]);
        } else if (urls.length > 1) {
          Linking.openURL(urls[1]);
        }
      });
    }
  }, [facilityData?.facility]);

  const isSearchMode = query.length >= 2;
  const displayFacilities = isSearchMode ? searchResults : popularFacilities;
  const isLoading = isSearchMode ? isSearching : isLoadingPopular;
  const sectionTitle = isSearchMode
    ? searchResults?.length
      ? `${searchResults.length} Result${searchResults.length !== 1 ? 's' : ''}`
      : ''
    : 'Popular Facilities';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>🔍 Check Facility</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Look up facilities before accepting a load
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, city, or address..."
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

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Facility List (left side on larger screens, full on mobile) */}
        {!selectedFacilityId && (
          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  {isSearchMode ? 'Searching...' : 'Loading facilities...'}
                </Text>
              </View>
            ) : !displayFacilities?.length ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏭</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  {isSearchMode ? 'No facilities found' : 'No facilities yet'}
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {isSearchMode
                    ? 'Try a different search term'
                    : 'Facilities will appear as drivers review them'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  {sectionTitle}
                </Text>
                <FlatList
                  data={displayFacilities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <FacilityListItem
                      facility={item}
                      onPress={() => handleSelectFacility(item)}
                      isSelected={selectedFacilityId === item.id}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>
        )}

        {/* Facility Preview (when selected) */}
        {selectedFacilityId && (
          <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.card }]}
              onPress={handleClearSelection}
            >
              <Text style={[styles.backButtonText, { color: theme.primary }]}>
                ← Back to Search
              </Text>
            </TouchableOpacity>

            {isLoadingDetails ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Loading facility details...
                </Text>
              </View>
            ) : facilityData ? (
              <FacilityPreviewCard
                facility={facilityData.facility}
                reviews={facilityData.reviews}
                onGetDirections={handleGetDirections}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  Failed to load facility details
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Quick Tips */}
      {!selectedFacilityId && (
        <View style={[styles.tipsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.textPrimary }]}>💡 Pro Tips</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Check payment reliability before accepting loads
          </Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Long average wait times may indicate scheduling issues
          </Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Review comments for insider tips on check-in
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
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
  mainContent: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listContent: {
    gap: 8,
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemAddress: {
    fontSize: 13,
    marginBottom: 4,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemRating: {
    fontSize: 12,
    fontWeight: '500',
  },
  listItemReviews: {
    fontSize: 11,
  },
  listItemType: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  previewContainer: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
