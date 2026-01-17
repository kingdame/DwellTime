/**
 * FacilityPreviewCard Component
 * Displays detailed facility information for pre-load lookup
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import type { Facility, FacilityReview } from '@/shared/types';
import { PaymentReliabilityBadge } from './PaymentReliabilityCard';
import { TruckEntranceCard } from './TruckEntranceCard';
import { useFacilityPaymentStats } from '../hooks/useFacilitiesConvex';
import { useAuthStore } from '@/features/auth';
import type { Id } from '@/convex/_generated/dataModel';

// Extended facility type with truck entrance fields
interface FacilityWithTruckEntrance extends Facility {
  truck_entrance_different?: boolean | null;
  truck_entrance_address?: string | null;
  truck_entrance_lat?: number | null;
  truck_entrance_lng?: number | null;
  truck_entrance_notes?: string | null;
  truck_entrance_verified_count?: number | null;
  truck_entrance_last_updated_at?: string | null;
}

interface FacilityPreviewCardProps {
  facility: FacilityWithTruckEntrance;
  reviews?: FacilityReview[];
  onViewDetails?: () => void;
  onGetDirections?: () => void;
}

function formatWaitTime(minutes: number | null): string {
  if (minutes === null) return 'No data';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function StarRating({ rating, size = 14 }: { rating: number | null; size?: number }) {
  const theme = colors.dark;
  if (rating === null) {
    return <Text style={{ color: theme.textDisabled, fontSize: size }}>No ratings</Text>;
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Text key={`full-${i}`} style={{ fontSize: size }}>⭐</Text>
      ))}
      {hasHalfStar && <Text style={{ fontSize: size }}>⭐</Text>}
      {[...Array(emptyStars)].map((_, i) => (
        <Text key={`empty-${i}`} style={{ fontSize: size, opacity: 0.3 }}>⭐</Text>
      ))}
      <Text style={{ marginLeft: 6, fontSize: size, color: theme.textPrimary, fontWeight: '600' }}>
        {rating.toFixed(1)}
      </Text>
      <Text style={{ marginLeft: 4, fontSize: size - 2, color: theme.textSecondary }}>
        ({fullStars > 0 ? 'based on reviews' : 'no reviews'})
      </Text>
    </View>
  );
}

function AmenityBadge({ available, label }: { available: boolean | null; label: string }) {
  const theme = colors.dark;
  if (available === null) return null;

  return (
    <View
      style={[
        styles.amenityBadge,
        {
          backgroundColor: available ? theme.success + '20' : theme.textDisabled + '20',
          borderColor: available ? theme.success : theme.textDisabled,
        },
      ]}
    >
      <Text style={{ color: available ? theme.success : theme.textDisabled, fontSize: 12 }}>
        {available ? '✓' : '✗'} {label}
      </Text>
    </View>
  );
}

function ReviewCard({ review }: { review: FacilityReview }) {
  const theme = colors.dark;
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
      <View style={styles.reviewHeader}>
        <StarRating rating={review.overall_rating} size={12} />
        <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>{date}</Text>
      </View>
      {review.comment && (
        <Text style={[styles.reviewComment, { color: theme.textPrimary }]} numberOfLines={3}>
          "{review.comment}"
        </Text>
      )}
      {/* Sub-ratings */}
      {(review.wait_time_rating || review.staff_rating) && (
        <View style={styles.subRatings}>
          {review.wait_time_rating && (
            <Text style={[styles.subRating, { color: theme.textSecondary }]}>
              Wait: {review.wait_time_rating}/5
            </Text>
          )}
          {review.staff_rating && (
            <Text style={[styles.subRating, { color: theme.textSecondary }]}>
              Staff: {review.staff_rating}/5
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function FacilityPreviewCard({
  facility,
  reviews = [],
  onViewDetails,
  onGetDirections,
}: FacilityPreviewCardProps) {
  const theme = colors.dark;
  const { userProfile } = useAuthStore();
  const paymentStats = useFacilityPaymentStats(facility.id as Id<"facilities"> | undefined);
  const reliability = paymentStats ? {
    paymentRate: paymentStats.paymentRate,
    avgPaymentDays: paymentStats.avgPaymentDays,
    reliability: paymentStats.paymentRate >= 90 ? 'excellent' as const :
                 paymentStats.paymentRate >= 75 ? 'good' as const :
                 paymentStats.paymentRate >= 50 ? 'fair' as const :
                 paymentStats.totalReports > 0 ? 'poor' as const : 'unknown' as const,
    reliabilityColor: paymentStats.paymentRate >= 90 ? colors.dark.success :
                      paymentStats.paymentRate >= 75 ? colors.dark.primary :
                      paymentStats.paymentRate >= 50 ? colors.dark.warning :
                      colors.dark.danger,
  } : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.facilityName, { color: theme.textPrimary }]} numberOfLines={2}>
            {facility.name}
          </Text>
          {facility.address && (
            <Text style={[styles.address, { color: theme.textSecondary }]} numberOfLines={2}>
              {facility.address}
              {facility.city ? `, ${facility.city}` : ''}
              {facility.state ? `, ${facility.state}` : ''}
              {facility.zip ? ` ${facility.zip}` : ''}
            </Text>
          )}
          <View style={styles.typeBadge}>
            <Text style={[styles.typeText, { color: theme.primary }]}>
              {facility.facility_type === 'both'
                ? 'Shipper / Receiver'
                : facility.facility_type.charAt(0).toUpperCase() + facility.facility_type.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Key Stats */}
      <View style={[styles.statsGrid, { borderColor: theme.card }]}>
        {/* Rating */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Overall Rating</Text>
          <StarRating rating={facility.avg_rating} />
          {facility.total_reviews > 0 && (
            <Text style={[styles.statSubtext, { color: theme.textDisabled }]}>
              {facility.total_reviews} review{facility.total_reviews !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Wait Time */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Wait Time</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {formatWaitTime(facility.avg_wait_minutes)}
          </Text>
          {facility.avg_wait_minutes !== null && facility.avg_wait_minutes > 120 && (
            <Text style={[styles.statWarning, { color: theme.warning }]}>⚠️ Long waits</Text>
          )}
        </View>

        {/* Payment Reliability */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Payment Reliability</Text>
          {reliability ? (
            <PaymentReliabilityBadge
              reliability={reliability.reliability}
              paymentRate={reliability.paymentRate}
            />
          ) : (
            <Text style={{ color: theme.textDisabled, fontSize: 14 }}>Loading...</Text>
          )}
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          <AmenityBadge available={facility.overnight_parking} label="Overnight Parking" />
          <AmenityBadge available={facility.restrooms} label="Restrooms" />
          <AmenityBadge available={facility.driver_lounge} label="Driver Lounge" />
          <AmenityBadge available={facility.showers_available} label="Showers" />
          <AmenityBadge available={facility.wifi_available} label="WiFi" />
          <AmenityBadge available={facility.water_available} label="Water" />
          <AmenityBadge available={facility.vending_machines} label="Vending" />
        </View>
        {!facility.overnight_parking &&
          !facility.restrooms &&
          !facility.driver_lounge &&
          !facility.showers_available && (
            <Text style={[styles.noAmenities, { color: theme.textDisabled }]}>
              No amenity information available
            </Text>
          )}
      </View>

      {/* Truck Entrance */}
      <View style={styles.section}>
        <TruckEntranceCard facility={facility} userId={user?.id || null} />
      </View>

      {/* Recent Reviews */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Recent Reviews {reviews.length > 0 && `(${reviews.length})`}
        </Text>
        {reviews.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsScroll}>
            {reviews.slice(0, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.noData, { color: theme.textDisabled }]}>
            No reviews yet. Be the first to review!
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onGetDirections && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={onGetDirections}
          >
            <Text style={styles.actionButtonText}>🧭 Get Directions</Text>
          </TouchableOpacity>
        )}
        {onViewDetails && (
          <TouchableOpacity
            style={[styles.actionButtonSecondary, { borderColor: theme.primary }]}
            onPress={onViewDetails}
          >
            <Text style={[styles.actionButtonTextSecondary, { color: theme.primary }]}>
              View Full Details
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    gap: 4,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: '700',
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
  },
  typeBadge: {
    marginTop: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 16,
    gap: 16,
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statSubtext: {
    fontSize: 12,
  },
  statWarning: {
    fontSize: 12,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  noAmenities: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  noData: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  reviewsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  reviewCard: {
    width: 280,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  subRatings: {
    flexDirection: 'row',
    gap: 12,
  },
  subRating: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
  },
});
