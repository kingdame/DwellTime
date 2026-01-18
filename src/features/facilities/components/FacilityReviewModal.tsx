/**
 * FacilityReviewModal - Premium glass-morphism review modal
 * Features: Star ratings, category ratings, comments, animated entrance
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { spacing, typography, radius, palette, animation } from '@/shared/theme/tokens';
import { GlassCard } from '@/shared/components/ui';
import { useCreateReview } from '../hooks/useFacilitiesConvex';
import type { Id } from '../../../../convex/_generated/dataModel';

// Star icon component
const Star = ({ filled, size = 32 }: { filled: boolean; size?: number }) => (
  <Text style={{ fontSize: size, color: filled ? '#FFD700' : palette.dark.textDisabled }}>
    {filled ? '★' : '☆'}
  </Text>
);

// Star Rating component
interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

function StarRating({ rating, onRatingChange, size = 32, disabled = false }: StarRatingProps) {
  const handlePress = (index: number) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRatingChange(index + 1);
  };

  return (
    <View style={styles.starContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(index)}
          disabled={disabled}
          style={styles.starButton}
        >
          <Star filled={index < rating} size={size} />
        </Pressable>
      ))}
    </View>
  );
}

// Rating category row
interface RatingCategoryProps {
  icon: string;
  label: string;
  rating: number;
  onRatingChange: (rating: number) => void;
}

function RatingCategory({ icon, label, rating, onRatingChange }: RatingCategoryProps) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryLabel}>
        <Text style={styles.categoryIcon}>{icon}</Text>
        <Text style={styles.categoryText}>{label}</Text>
      </View>
      <StarRating rating={rating} onRatingChange={onRatingChange} size={24} />
    </View>
  );
}

interface FacilityReviewModalProps {
  visible: boolean;
  onClose: () => void;
  facilityId: Id<'facilities'>;
  facilityName: string;
  userId: Id<'users'>;
  detentionEventId?: Id<'detentionEvents'>;
  onSubmitSuccess?: () => void;
}

export function FacilityReviewModal({
  visible,
  onClose,
  facilityId,
  facilityName,
  userId,
  detentionEventId,
  onSubmitSuccess,
}: FacilityReviewModalProps) {
  const theme = colors.dark;
  const createReview = useCreateReview();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [waitTimeRating, setWaitTimeRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [restroomRating, setRestroomRating] = useState(0);
  const [parkingRating, setParkingRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
      modalScale.value = withSpring(1, animation.spring.bouncy);
      modalOpacity.value = withTiming(1, { duration: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, backdropOpacity, modalScale, modalOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const handleSubmit = useCallback(async () => {
    if (overallRating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createReview({
        userId,
        facilityId,
        detentionEventId,
        overallRating,
        waitTimeRating: waitTimeRating > 0 ? waitTimeRating : undefined,
        staffRating: staffRating > 0 ? staffRating : undefined,
        restroomRating: restroomRating > 0 ? restroomRating : undefined,
        parkingRating: parkingRating > 0 ? parkingRating : undefined,
        safetyRating: safetyRating > 0 ? safetyRating : undefined,
        cleanlinessRating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
        comment: comment.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmitSuccess?.();
      onClose();

      // Reset form
      setOverallRating(0);
      setWaitTimeRating(0);
      setStaffRating(0);
      setRestroomRating(0);
      setParkingRating(0);
      setSafetyRating(0);
      setCleanlinessRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    overallRating,
    waitTimeRating,
    staffRating,
    restroomRating,
    parkingRating,
    safetyRating,
    cleanlinessRating,
    comment,
    userId,
    facilityId,
    detentionEventId,
    createReview,
    onSubmitSuccess,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <GlassCard padding="xxl" style={styles.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Rate Your Experience</Text>
                <Text style={styles.facilityName} numberOfLines={2}>
                  {facilityName}
                </Text>
              </View>

              {/* Overall Rating */}
              <View style={styles.overallSection}>
                <Text style={styles.sectionLabel}>Overall Rating *</Text>
                <StarRating
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                  size={40}
                />
                <Text style={styles.ratingHint}>
                  {overallRating === 0
                    ? 'Tap to rate'
                    : overallRating === 1
                    ? 'Poor'
                    : overallRating === 2
                    ? 'Fair'
                    : overallRating === 3
                    ? 'Good'
                    : overallRating === 4
                    ? 'Very Good'
                    : 'Excellent'}
                </Text>
              </View>

              {/* Category Ratings */}
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionLabel}>Rate by Category (Optional)</Text>
                <RatingCategory
                  icon="⏱️"
                  label="Wait Time"
                  rating={waitTimeRating}
                  onRatingChange={setWaitTimeRating}
                />
                <RatingCategory
                  icon="👥"
                  label="Staff"
                  rating={staffRating}
                  onRatingChange={setStaffRating}
                />
                <RatingCategory
                  icon="🚻"
                  label="Restrooms"
                  rating={restroomRating}
                  onRatingChange={setRestroomRating}
                />
                <RatingCategory
                  icon="🅿️"
                  label="Parking"
                  rating={parkingRating}
                  onRatingChange={setParkingRating}
                />
                <RatingCategory
                  icon="🛡️"
                  label="Safety"
                  rating={safetyRating}
                  onRatingChange={setSafetyRating}
                />
                <RatingCategory
                  icon="✨"
                  label="Cleanliness"
                  rating={cleanlinessRating}
                  onRatingChange={setCleanlinessRating}
                />
              </View>

              {/* Comment */}
              <View style={styles.commentSection}>
                <Text style={styles.sectionLabel}>Comments (Optional)</Text>
                <TextInput
                  style={[styles.commentInput, { backgroundColor: theme.backgroundSecondary }]}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your experience with other drivers..."
                  placeholderTextColor={theme.textDisabled}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    styles.submitButton,
                    overallRating === 0 && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || overallRating === 0}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.buttonText, styles.submitButtonText]}>
                      Submit Review
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.dark.overlay,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  modal: {
    // GlassCard handles styling
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: palette.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  facilityName: {
    fontSize: typography.size.lg,
    color: palette.dark.textSecondary,
    textAlign: 'center',
  },
  overallSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: palette.dark.divider,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: palette.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xxs,
  },
  ratingHint: {
    fontSize: typography.size.md,
    color: palette.dark.primary,
    marginTop: spacing.sm,
    fontWeight: typography.weight.medium,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.dark.dividerLight,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: typography.size.md,
    color: palette.dark.textPrimary,
  },
  commentSection: {
    marginBottom: spacing.xl,
  },
  commentInput: {
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: typography.size.md,
    color: palette.dark.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: palette.dark.divider,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: palette.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: palette.dark.divider,
  },
  submitButton: {
    backgroundColor: palette.dark.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  cancelButtonText: {
    color: palette.dark.textSecondary,
  },
  submitButtonText: {
    color: '#fff',
  },
});
