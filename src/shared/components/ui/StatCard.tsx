/**
 * StatCard - Glass card variant for displaying statistics
 * Features: GlassCard base, icon header, LargeNumber value, trend indicator
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { LargeNumber } from './LargeNumber';
import { palette, spacing, typography, animation, radius } from '../../theme/tokens';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  animationDelay?: number;
  size?: 'compact' | 'default' | 'large';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = palette.dark.primary,
  onPress,
  style,
  animationDelay = 0,
  size = 'default',
}: StatCardProps) {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(animationDelay, withSpring(1, animation.spring.bouncy));
    opacity.value = withDelay(
      animationDelay,
      withSpring(1, { damping: 20, stiffness: 200 })
    );
  }, [animationDelay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const numberSize = size === 'compact' ? 'small' : size === 'large' ? 'large' : 'medium';
  const padding = size === 'compact' ? 'lg' : 'xxl';

  return (
    <Animated.View style={[style, animatedStyle]}>
      <GlassCard onPress={onPress} padding={padding}>
        {/* Header */}
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Value */}
        <View style={styles.valueContainer}>
          <LargeNumber
            value={value}
            color={color}
            size={numberSize}
            animated={false}
            align="left"
          />
        </View>

        {/* Subtitle */}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Trend */}
        {trend && (
          <View style={styles.trendContainer}>
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor:
                    trend.value >= 0
                      ? palette.dark.successMuted
                      : palette.dark.errorMuted,
                },
              ]}
            >
              <Text
                style={[
                  styles.trendValue,
                  {
                    color:
                      trend.value >= 0 ? palette.dark.success : palette.dark.error,
                  },
                ]}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </Text>
            </View>
            <Text style={styles.trendLabel}>{trend.label}</Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: palette.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
  },
  valueContainer: {
    marginVertical: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: palette.dark.textSecondary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.dark.divider,
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    marginRight: spacing.sm,
  },
  trendValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  trendLabel: {
    fontSize: typography.size.sm,
    color: palette.dark.textTertiary,
  },
});
