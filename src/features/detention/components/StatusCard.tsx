/**
 * StatusCard Component - Premium Edition
 * Glass-morphism card with animated tracking status
 */

import { View, Text, StyleSheet } from 'react-native';
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
import { GlassCard, StatusBadge, PremiumButton } from '../../../shared/components/ui';
import { spacing, typography, radius } from '../../../shared/theme/tokens';
import { TimerDisplay } from './TimerDisplay';

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
}

export function StatusCard({
  timerState,
  onStartTracking,
  onStopTracking,
}: StatusCardProps) {
  const theme = colors.dark;
  const isActive = timerState.isActive;

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

      <GlassCard padding="xxl">
        {/* Status Header */}
        <View style={styles.header}>
          <StatusBadge
            status={isActive ? (timerState.isInGracePeriod ? 'info' : 'active') : 'neutral'}
            label={
              isActive
                ? timerState.isInGracePeriod
                  ? 'Grace Period'
                  : 'Earning'
                : 'Ready'
            }
            pulse={isActive}
            size="medium"
          />
        </View>

        {/* Content based on state */}
        {isActive ? (
          <>
            <TimerDisplay
              elapsedFormatted={timerState.elapsedFormatted}
              detentionFormatted={timerState.detentionFormatted}
              earningsFormatted={timerState.earningsFormatted}
              isInGracePeriod={timerState.isInGracePeriod}
            />
            <View style={styles.buttonContainer}>
              <PremiumButton
                title="End Detention"
                onPress={onStopTracking}
                variant="danger"
                size="large"
                fullWidth
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.idleContent}>
              <Text style={[styles.idleTitle, { color: theme.textPrimary }]}>
                Ready to Track
              </Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                Start tracking when you arrive at a facility to document detention
                time and earn your money.
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <PremiumButton
                title="Start Tracking"
                onPress={onStartTracking}
                variant="primary"
                size="large"
                fullWidth
              />
            </View>
          </>
        )}
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
  header: {
    marginBottom: spacing.lg,
  },
  idleContent: {
    paddingVertical: spacing.xxl,
  },
  idleTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.leading.relaxed,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});
