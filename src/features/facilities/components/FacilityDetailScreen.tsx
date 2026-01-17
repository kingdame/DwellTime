/**
 * FacilityDetailScreen - Comprehensive facility detail view
 * Features: Glass cards, reviews, amenities, payment stats, actions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { palette, spacing, typography, radius, animation } from '@/shared/theme/tokens';
import { colors } from '@/constants/colors';
import { GlassCard, StatCard, StatusBadge } from '@/shared/components/ui';
import { AmenitiesDisplay } from './AmenitiesDisplay';
import { FacilityReviewModal } from './FacilityReviewModal';
import { AmenitiesEditModal } from './AmenitiesEditModal';
import {
  useFacilityReviews,
  useFacilityPaymentStats,
} from '../hooks/useFacilitiesConvex';
import type { Id } from '../../../../convex/_generated/dataModel';

// Star display component
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={{
            fontSize: size,
            color: star <= rating ? '#FFD700' : palette.dark.textDisabled,
          }}
        >
          {star <= rating ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

// Review card component
interface ReviewCardProps {
  review: {
    _id: string;
    userName: string;
    overallRating: number;
    comment?: string;
    _creationTime: number;
    waitTimeRating?: number;
    staffRating?: number;
  };
  index: number;
}

function ReviewCard({ review, index }: ReviewCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(index * 100, withSpring(0, animation.spring.gentle));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const date = new Date(review._creationTime);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard padding="lg" style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{review.userName[0]?.toUpperCase() || 'A'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{review.userName}</Text>
              <Text style={styles.reviewDate}>{dateStr}</Text>
            </View>
          </View>
          <StarDisplay rating={review.overallRating} />
        </View>
        {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
        {(review.waitTimeRating || review.staffRating) && (
          <View style={styles.categoryRatings}>
            {review.waitTimeRating && (
              <View style={styles.categoryRating}>
                <Text style={styles.categoryLabel}>⏱️ Wait</Text>
                <StarDisplay rating={review.waitTimeRating} size={12} />
              </View>
            )}
            {review.staffRating && (
              <View style={styles.categoryRating}>
                <Text style={styles.categoryLabel}>👥 Staff</Text>
                <StarDisplay rating={review.staffRating} size={12} />
              </View>
            )}
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

interface Facility {
  _id: Id<'facilities'>;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  facilityType: 'shipper' | 'receiver' | 'both' | 'unknown';
  avgRating?: number;
  avgWaitMinutes?: number;
  totalReviews: number;
  overnightParking?: boolean;
  parkingSpaces?: number;
  restrooms?: boolean;
  driverLounge?: boolean;
  waterAvailable?: boolean;
  vendingMachines?: boolean;
  wifiAvailable?: boolean;
  showersAvailable?: boolean;
}

interface FacilityDetailScreenProps {
  facility: Facility;
  userId?: Id<'users'>;
  detentionEventId?: Id<'detentionEvents'>;
  onBack?: () => void;
  onStartTracking?: () => void;
}

export function FacilityDetailScreen({
  facility,
  userId,
  detentionEventId,
  onBack,
  onStartTracking,
}: FacilityDetailScreenProps) {
  const theme = colors.dark;

  // Convex data
  const reviews = useFacilityReviews(facility._id, 10);
  const paymentStats = useFacilityPaymentStats(facility._id);

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-20);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    headerTranslate.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [headerOpacity, headerTranslate]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Convex queries auto-refresh, just need to wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleWriteReview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReviewModal(true);
  }, []);

  const handleEditAmenities = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAmenitiesModal(true);
  }, []);

  // Format address
  const fullAddress = [facility.address, facility.city, facility.state, facility.zip]
    .filter(Boolean)
    .join(', ');

  // Facility type badge
  const typeLabel =
    facility.facilityType === 'both'
      ? 'Shipper & Receiver'
      : facility.facilityType.charAt(0).toUpperCase() + facility.facilityType.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          {onBack && (
            <Pressable style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          )}
          <Text style={styles.facilityName}>{facility.name}</Text>
          <Text style={styles.facilityAddress}>{fullAddress || 'Address not available'}</Text>

          <View style={styles.badges}>
            <StatusBadge
              status={
                facility.facilityType === 'shipper'
                  ? 'info'
                  : facility.facilityType === 'receiver'
                  ? 'warning'
                  : 'neutral'
              }
              label={typeLabel}
              showDot={false}
            />
            {facility.avgRating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {facility.avgRating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({facility.totalReviews} reviews)</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Avg Wait"
            value={facility.avgWaitMinutes ? `${facility.avgWaitMinutes}m` : 'N/A'}
            icon="⏱️"
            color={theme.warning}
            size="compact"
            style={styles.statCard}
            animationDelay={100}
          />
          <StatCard
            title="Rating"
            value={facility.avgRating ? facility.avgRating.toFixed(1) : 'N/A'}
            icon="⭐"
            color="#FFD700"
            size="compact"
            style={styles.statCard}
            animationDelay={200}
          />
          <StatCard
            title="Reviews"
            value={String(facility.totalReviews)}
            icon="📝"
            color={theme.primary}
            size="compact"
            style={styles.statCard}
            animationDelay={300}
          />
        </View>

        {/* Payment Stats */}
        {paymentStats && paymentStats.totalClaims > 0 && (
          <GlassCard padding="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💰 Payment History</Text>
            </View>
            <View style={styles.paymentStats}>
              <View style={styles.paymentStat}>
                <Text style={styles.paymentValue}>
                  {paymentStats.paymentRate?.toFixed(0) || 0}%
                </Text>
                <Text style={styles.paymentLabel}>Paid Claims</Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentStat}>
                <Text style={styles.paymentValue}>
                  {paymentStats.avgPaymentDays || 'N/A'}
                </Text>
                <Text style={styles.paymentLabel}>Avg Days to Pay</Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentStat}>
                <Text style={styles.paymentValue}>
                  {paymentStats.avgPaymentAmount
                    ? `$${paymentStats.avgPaymentAmount.toFixed(0)}`
                    : 'N/A'}
                </Text>
                <Text style={styles.paymentLabel}>Avg Amount</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Amenities */}
        <GlassCard padding="xl" style={styles.section}>
          <AmenitiesDisplay
            amenities={{
              overnightParking: facility.overnightParking,
              parkingSpaces: facility.parkingSpaces,
              restrooms: facility.restrooms,
              driverLounge: facility.driverLounge,
              waterAvailable: facility.waterAvailable,
              vendingMachines: facility.vendingMachines,
              wifiAvailable: facility.wifiAvailable,
              showersAvailable: facility.showersAvailable,
            }}
            showUnknown={true}
            onEditPress={handleEditAmenities}
          />
        </GlassCard>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Driver Reviews</Text>
            {userId && (
              <Pressable style={styles.writeReviewButton} onPress={handleWriteReview}>
                <Text style={styles.writeReviewText}>+ Write Review</Text>
              </Pressable>
            )}
          </View>

          {reviews && reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((review, index) => (
                <ReviewCard key={review._id} review={review} index={index} />
              ))}
            </View>
          ) : (
            <GlassCard padding="xl" style={styles.emptyReviews}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>Be the first to review this facility!</Text>
            </GlassCard>
          )}
        </View>

        {/* Action Buttons */}
        {onStartTracking && (
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={onStartTracking}>
              <Text style={styles.primaryButtonText}>🕐 Start Tracking Here</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      {userId && (
        <FacilityReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          facilityId={facility._id}
          facilityName={facility.name}
          userId={userId}
          detentionEventId={detentionEventId}
        />
      )}

      <AmenitiesEditModal
        visible={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        facilityId={facility._id}
        facilityName={facility.name}
        currentAmenities={{
          overnightParking: facility.overnightParking,
          parkingSpaces: facility.parkingSpaces,
          restrooms: facility.restrooms,
          driverLounge: facility.driverLounge,
          waterAvailable: facility.waterAvailable,
          vendingMachines: facility.vendingMachines,
          wifiAvailable: facility.wifiAvailable,
          showersAvailable: facility.showersAvailable,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: 40,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.size.md,
    color: palette.dark.primary,
    fontWeight: typography.weight.medium,
  },
  facilityName: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  facilityAddress: {
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  ratingText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#FFD700',
  },
  reviewCount: {
    fontSize: typography.size.xs,
    color: palette.dark.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  writeReviewButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.dark.primaryMuted,
    borderRadius: radius.full,
  },
  writeReviewText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.primary,
  },
  paymentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  paymentStat: {
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.money,
  },
  paymentLabel: {
    fontSize: typography.size.xs,
    color: palette.dark.textSecondary,
    marginTop: spacing.xxs,
  },
  paymentDivider: {
    width: 1,
    height: 40,
    backgroundColor: palette.dark.divider,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewCard: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: '#fff',
  },
  userName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textPrimary,
  },
  reviewDate: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
    lineHeight: typography.size.md * typography.leading.relaxed,
  },
  categoryRatings: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.dark.dividerLight,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 40,
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
  },
  actions: {
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: palette.dark.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },
});
