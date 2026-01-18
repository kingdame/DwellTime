/**
 * StatusCard Component - Premium Edition
 * Glass-morphism card with animated circular timer
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../../../constants/colors';
import { GlassCard, StatusBadge, PremiumButton, CircularTimer } from '../../../shared/components/ui';
import { spacing, typography, radius, palette } from '../../../shared/theme/tokens';

export interface DetentionTimerState {
  isActive: boolean;
  startTime: Date | null;
  elapsedMs: number;
  elapsedFormatted: string;
  detentionMs: number;
  detentionFormatted: string;
  earningsFormatted: string;
  isInGracePeriod: boolean;
}

interface StatusCardProps {
  timerState: DetentionTimerState;
  onStartTracking: () => void;
  onStopTracking: () => void;
  facilityName?: string;
  gracePeriodMinutes?: number;
  hourlyRate?: number;
}

export function StatusCard({
  timerState,
  onStartTracking,
  onStopTracking,
  facilityName,
  gracePeriodMinutes = 120,
  hourlyRate = 75,
}: StatusCardProps) {
  const theme = colors.dark;
  const isActive = timerState.isActive;

  // Calculate earnings from detention time
  const earnings = timerState.detentionMs > 0 
    ? (timerState.detentionMs / (1000 * 60 * 60)) * hourlyRate 
    : 0;

  // Calculate elapsed seconds for CircularTimer
  const elapsedSeconds = Math.floor(timerState.elapsedMs / 1000);
  const gracePeriodSeconds = gracePeriodMinutes * 60;

  // Determine timer status
  const timerStatus = !isActive 
    ? 'ready' 
    : timerState.isInGracePeriod 
      ? 'grace' 
      : 'detention';

  // Animated glow for active state
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Entrance animation
  const entranceOpacity = useSharedValue(0);
  const entranceTranslate = useSharedValue(20);

  useEffect(() => {
    entranceOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    entranceTranslate.value = withDelay(
      100,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [entranceOpacity, entranceTranslate]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
    transform: [{ translateY: entranceTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, entranceStyle]}>
      {/* Glow effect behind card when active */}
      {isActive && (
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <LinearGradient
            colors={
              timerState.isInGracePeriod
                ? colors.gradients.primaryGlow
                : colors.gradients.successGlow
            }
            style={styles.glowGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      )}

      <GlassCard padding="lg">
        {/* Circular Timer - Always visible */}
        <Pressable 
          onPress={!isActive ? onStartTracking : undefined}
          style={styles.timerContainer}
        >
          <CircularTimer
            elapsedSeconds={elapsedSeconds}
            gracePeriodSeconds={gracePeriodSeconds}
            status={timerStatus}
            earnings={earnings}
            facilityName={isActive ? facilityName : undefined}
            size={280}
            strokeWidth={10}
          />
        </Pressable>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          {isActive ? (
            <PremiumButton
              title="End Detention"
              onPress={onStopTracking}
              variant="danger"
              size="large"
              fullWidth
            />
          ) : (
            <PremiumButton
              title="Start Tracking"
              onPress={onStartTracking}
              variant="primary"
              size="large"
              fullWidth
            />
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  glowContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
    borderRadius: radius.xxl,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
