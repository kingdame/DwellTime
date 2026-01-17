/**
 * TimerDisplay Component - Premium Edition
 * Large animated timer display with earnings
 */

import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { colors } from '../../../constants/colors';
import { LargeNumber } from '../../../shared/components/ui';
import { spacing, animation as animationTokens } from '../../../shared/theme/tokens';

interface TimerDisplayProps {
  elapsedFormatted: string;
  detentionFormatted: string;
  earningsFormatted: string;
  isInGracePeriod: boolean;
}

export function TimerDisplay({
  elapsedFormatted,
  detentionFormatted,
  earningsFormatted,
  isInGracePeriod,
}: TimerDisplayProps) {
  // Animate value changes
  const timerScale = useSharedValue(1);
  const earningsScale = useSharedValue(1);
  const prevEarnings = useRef(earningsFormatted);

  // Pulse timer on each second
  useEffect(() => {
    timerScale.value = withSequence(
      withSpring(1.01, { damping: 20, stiffness: 400 }),
      withSpring(1, animationTokens.spring.snappy)
    );
  }, [isInGracePeriod ? elapsedFormatted : detentionFormatted, timerScale]);

  // Animate earnings when they change
  useEffect(() => {
    if (earningsFormatted !== prevEarnings.current && earningsFormatted !== '$0.00') {
      earningsScale.value = withSequence(
        withSpring(1.05, { damping: 15, stiffness: 400 }),
        withSpring(1, animationTokens.spring.snappy)
      );
      prevEarnings.current = earningsFormatted;
    }
  }, [earningsFormatted, earningsScale]);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const earningsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: earningsScale.value }],
  }));

  const displayTime = isInGracePeriod ? elapsedFormatted : detentionFormatted;
  const timeColor = isInGracePeriod ? colors.timer : colors.money;
  const timeLabel = isInGracePeriod ? 'Grace Period' : 'Detention Time';

  return (
    <View style={styles.container}>
      {/* Main Timer */}
      <Animated.View style={timerAnimatedStyle}>
        <LargeNumber
          value={displayTime}
          label={timeLabel}
          color={timeColor}
          size="timer"
          animated={false}
        />
      </Animated.View>

      {/* Earnings Display */}
      <View style={styles.earningsContainer}>
        <Animated.View style={earningsAnimatedStyle}>
          <LargeNumber
            value={earningsFormatted}
            label={isInGracePeriod ? 'Billable after grace period' : 'Current Earnings'}
            color={colors.money}
            size="large"
            animated={false}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  earningsContainer: {
    marginTop: spacing.xxl,
  },
});
