/**
 * CircularTimer - Premium animated circular progress timer
 * Inspired by modern app designs with glass-morphism and gradient effects
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { palette, typography, spacing, shadows, animation } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerStatus = 'ready' | 'grace' | 'detention' | 'completed';

interface CircularTimerProps {
  /** Current elapsed time in seconds */
  elapsedSeconds: number;
  /** Grace period in seconds (default: 2 hours = 7200) */
  gracePeriodSeconds?: number;
  /** Current status */
  status: TimerStatus;
  /** Current earnings (shown when in detention) */
  earnings?: number;
  /** Facility name */
  facilityName?: string;
  /** Size of the timer (default: 280) */
  size?: number;
  /** Stroke width (default: 12) */
  strokeWidth?: number;
}

// Format time as HH:MM:SS
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format currency
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function CircularTimer({
  elapsedSeconds,
  gracePeriodSeconds = 7200, // 2 hours default
  status,
  earnings = 0,
  facilityName,
  size = 280,
  strokeWidth = 12,
}: CircularTimerProps) {
  // Calculate dimensions
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 8; // Account for glow
  const circumference = 2 * Math.PI * radius;

  // Animated values
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const rotateValue = useSharedValue(0);

  // Calculate progress based on status
  useEffect(() => {
    let targetProgress = 0;

    if (status === 'ready') {
      targetProgress = 0;
      // Subtle idle pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2000 }),
          withTiming(0.4, { duration: 2000 })
        ),
        -1,
        true
      );
    } else if (status === 'grace') {
      // Progress fills during grace period (0-100%)
      targetProgress = Math.min(elapsedSeconds / gracePeriodSeconds, 1);
      pulseScale.value = 1;
      glowOpacity.value = 0.5;
    } else if (status === 'detention') {
      // Full circle when in detention, with continuous glow
      targetProgress = 1;
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );
      // Subtle rotation for active effect
      rotateValue.value = withRepeat(
        withTiming(360, { duration: 60000, easing: Easing.linear }),
        -1,
        false
      );
    } else if (status === 'completed') {
      targetProgress = 1;
      pulseScale.value = withSpring(1.05, animation.spring.bouncy);
      glowOpacity.value = 1;
    }

    progress.value = withTiming(targetProgress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [status, elapsedSeconds, gracePeriodSeconds, progress, pulseScale, glowOpacity, rotateValue]);

  // Animated props for the progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Animated style for the pulse effect
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Animated style for glow
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Get colors based on status
  const colors = useMemo(() => {
    switch (status) {
      case 'ready':
        return {
          primary: palette.dark.primary,
          secondary: palette.dark.primaryMuted,
          text: palette.dark.textSecondary,
          gradient: ['#3B82F6', '#60A5FA'] as const,
        };
      case 'grace':
        return {
          primary: palette.dark.warning,
          secondary: palette.dark.warningMuted,
          text: palette.dark.warning,
          gradient: ['#F97316', '#FBBF24'] as const,
        };
      case 'detention':
      case 'completed':
        return {
          primary: palette.money,
          secondary: palette.moneyMuted,
          text: palette.money,
          gradient: ['#22C55E', '#4ADE80'] as const,
        };
    }
  }, [status]);

  // Status label
  const statusLabel = useMemo(() => {
    switch (status) {
      case 'ready':
        return 'READY';
      case 'grace':
        return 'GRACE PERIOD';
      case 'detention':
        return 'DETENTION';
      case 'completed':
        return 'COMPLETED';
    }
  }, [status]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect layer */}
      <Animated.View style={[styles.glowLayer, glowStyle]}>
        <View
          style={[
            styles.glow,
            {
              width: size - 20,
              height: size - 20,
              borderRadius: (size - 20) / 2,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </Animated.View>

      {/* SVG Progress Ring */}
      <Animated.View style={pulseStyle}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.gradient[0]} />
              <Stop offset="100%" stopColor={colors.gradient[1]} />
            </LinearGradient>
            <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={palette.dark.backgroundSecondary} />
              <Stop offset="100%" stopColor={palette.dark.card} />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={palette.dark.divider}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.3}
          />

          {/* Track circle (subtle) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.5}
          />

          {/* Animated progress circle */}
          <G rotation={-90} origin={`${center}, ${center}`}>
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedCircleProps}
            />
          </G>
        </Svg>
      </Animated.View>

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>{statusLabel}</Text>
        </View>

        {/* Timer display */}
        <Text style={[styles.timerText, { color: palette.dark.textPrimary }]}>
          {formatTime(elapsedSeconds)}
        </Text>

        {/* Facility name or hint */}
        {facilityName ? (
          <Text style={styles.facilityName} numberOfLines={1}>
            {facilityName}
          </Text>
        ) : status === 'ready' ? (
          <Text style={styles.hintText}>Tap to start tracking</Text>
        ) : null}

        {/* Earnings (shown during detention) */}
        {(status === 'detention' || status === 'completed') && earnings > 0 && (
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>EARNED</Text>
            <Text style={[styles.earningsText, { color: colors.primary }]}>
              {formatCurrency(earnings)}
            </Text>
          </View>
        )}

        {/* Grace period countdown */}
        {status === 'grace' && (
          <View style={styles.graceContainer}>
            <Text style={styles.graceLabel}>Grace ends in</Text>
            <Text style={[styles.graceTime, { color: colors.primary }]}>
              {formatTime(Math.max(0, gracePeriodSeconds - elapsedSeconds))}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    ...Platform.select({
      ios: {
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
      web: {
        // Web uses filter for glow
      },
    }),
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.tracking.wider,
  },
  timerText: {
    fontSize: typography.size.timer,
    fontWeight: typography.weight.bold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: typography.tracking.timer,
  },
  facilityName: {
    fontSize: typography.size.sm,
    color: palette.dark.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 180,
    textAlign: 'center',
  },
  hintText: {
    fontSize: typography.size.sm,
    color: palette.dark.textTertiary,
    marginTop: spacing.sm,
  },
  earningsContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.xxs,
  },
  earningsText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  graceContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  graceLabel: {
    fontSize: typography.size.xs,
    color: palette.dark.textTertiary,
    marginBottom: spacing.xxs,
  },
  graceTime: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
