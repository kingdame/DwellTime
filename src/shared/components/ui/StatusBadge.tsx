/**
 * StatusBadge - Color-coded status indicators with animation
 * Features: animated entrance, optional pulse, pill shape with dot
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { palette, spacing, radius, typography, animation } from '../../theme/tokens';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'active';
type BadgeSize = 'small' | 'medium' | 'large';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  size?: BadgeSize;
  animated?: boolean;
  pulse?: boolean;
  showDot?: boolean;
  delay?: number;
}

const statusColors: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  success: {
    bg: palette.dark.successMuted,
    text: palette.dark.success,
    dot: palette.dark.success,
  },
  warning: {
    bg: palette.dark.warningMuted,
    text: palette.dark.warning,
    dot: palette.dark.warning,
  },
  error: {
    bg: palette.dark.errorMuted,
    text: palette.dark.error,
    dot: palette.dark.error,
  },
  info: {
    bg: palette.dark.primaryMuted,
    text: palette.dark.primary,
    dot: palette.dark.primary,
  },
  neutral: {
    bg: palette.dark.backgroundSecondary,
    text: palette.dark.textSecondary,
    dot: palette.dark.textTertiary,
  },
  active: {
    bg: palette.moneyMuted,
    text: palette.money,
    dot: palette.money,
  },
};

const sizeConfig = {
  small: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    fontSize: typography.size.xs,
    dotSize: 4,
  },
  medium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.sm,
    dotSize: 6,
  },
  large: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.md,
    dotSize: 8,
  },
};

export function StatusBadge({
  status,
  label,
  size = 'medium',
  animated = true,
  pulse = false,
  showDot = true,
  delay = 0,
}: StatusBadgeProps) {
  const scale = useSharedValue(animated ? 0.8 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      scale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
      opacity.value = withDelay(
        delay,
        withSpring(1, { damping: 20, stiffness: 200 })
      );
    }
  }, [animated, delay, scale, opacity]);

  useEffect(() => {
    if (pulse) {
      const doPulse = () => {
        pulseScale.value = withSequence(
          withSpring(1.08, animation.spring.snappy),
          withSpring(1, animation.spring.gentle)
        );
      };
      doPulse();
      const timer = setInterval(doPulse, 2500);
      return () => clearInterval(timer);
    }
  }, [pulse, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
    opacity: opacity.value,
  }));

  const colors = statusColors[status];
  const config = sizeConfig[size];

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
        },
        animatedStyle,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.dot,
              width: config.dotSize,
              height: config.dotSize,
              borderRadius: config.dotSize / 2,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: config.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: spacing.xs,
  },
  label: {
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
  },
});
