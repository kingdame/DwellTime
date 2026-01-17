/**
 * LargeNumber - Premium data display for timers, earnings, stats
 * Features: tabular nums, wide letter-spacing, entrance animation
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { palette, spacing, typography, animation } from '../../theme/tokens';

type NumberSize = 'small' | 'medium' | 'large' | 'hero' | 'timer';

interface LargeNumberProps {
  value: string;
  label?: string;
  color?: string;
  size?: NumberSize;
  prefix?: string;
  suffix?: string;
  animated?: boolean;
  animateOnChange?: boolean;
  delay?: number;
  style?: ViewStyle;
  align?: 'left' | 'center' | 'right';
}

const sizeConfig = {
  small: {
    fontSize: 24,
    letterSpacing: typography.tracking.wide,
    labelSize: typography.size.sm,
  },
  medium: {
    fontSize: 32,
    letterSpacing: typography.tracking.wider,
    labelSize: typography.size.md,
  },
  large: {
    fontSize: 48,
    letterSpacing: typography.tracking.widest,
    labelSize: typography.size.lg,
  },
  hero: {
    fontSize: 56,
    letterSpacing: typography.tracking.timer,
    labelSize: typography.size.lg,
  },
  timer: {
    fontSize: 64,
    letterSpacing: typography.tracking.timer,
    labelSize: typography.size.xl,
  },
};

export function LargeNumber({
  value,
  label,
  color = palette.dark.textPrimary,
  size = 'large',
  prefix,
  suffix,
  animated = true,
  animateOnChange = false,
  delay = 0,
  style,
  align = 'center',
}: LargeNumberProps) {
  const entranceScale = useSharedValue(animated ? 0.9 : 1);
  const entranceOpacity = useSharedValue(animated ? 0 : 1);
  const changeScale = useSharedValue(1);

  // Entrance animation
  useEffect(() => {
    if (animated) {
      entranceScale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
      entranceOpacity.value = withDelay(
        delay,
        withSpring(1, { damping: 20, stiffness: 200 })
      );
    }
  }, [animated, delay, entranceScale, entranceOpacity]);

  // Value change animation
  useEffect(() => {
    if (animateOnChange && !animated) {
      changeScale.value = withSequence(
        withSpring(1.03, { damping: 15, stiffness: 400 }),
        withSpring(1, animation.spring.snappy)
      );
    }
  }, [value, animateOnChange, animated, changeScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entranceScale.value * changeScale.value }],
    opacity: entranceOpacity.value,
  }));

  const config = sizeConfig[size];
  const alignItems =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <Animated.View style={[styles.container, { alignItems }, style, animatedStyle]}>
      <View style={styles.valueRow}>
        {prefix && (
          <Text
            style={[
              styles.prefix,
              {
                color,
                fontSize: config.fontSize * 0.5,
              },
            ]}
          >
            {prefix}
          </Text>
        )}
        <Text
          style={[
            styles.value,
            {
              color,
              fontSize: config.fontSize,
              letterSpacing: config.letterSpacing,
            },
          ]}
        >
          {value}
        </Text>
        {suffix && (
          <Text
            style={[
              styles.suffix,
              {
                fontSize: config.fontSize * 0.35,
              },
            ]}
          >
            {suffix}
          </Text>
        )}
      </View>
      {label && (
        <Text style={[styles.label, { fontSize: config.labelSize }]}>{label}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // alignItems set dynamically
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontWeight: typography.weight.bold,
    fontVariant: ['tabular-nums'],
  },
  prefix: {
    fontWeight: typography.weight.semibold,
    marginRight: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  suffix: {
    fontWeight: typography.weight.medium,
    marginLeft: spacing.xs,
    color: palette.dark.textSecondary,
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
  },
  label: {
    marginTop: spacing.sm,
    color: palette.dark.textSecondary,
    fontWeight: typography.weight.medium,
  },
});
