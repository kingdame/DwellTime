/**
 * TimerDisplay Component
 * Shows active detention timer with elapsed time and earnings
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants';

interface TimerDisplayProps {
  elapsedFormatted: string;
  detentionFormatted: string;
  earningsFormatted: string;
  isInGracePeriod: boolean;
  isDark: boolean;
}

export function TimerDisplay({
  elapsedFormatted,
  detentionFormatted,
  earningsFormatted,
  isInGracePeriod,
  isDark,
}: TimerDisplayProps) {
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      {/* Main Timer */}
      <Text style={[styles.timerValue, { color: colors.timer }]}>
        {isInGracePeriod ? elapsedFormatted : detentionFormatted}
      </Text>

      <Text style={[styles.timerLabel, { color: themeColors.textSecondary }]}>
        {isInGracePeriod ? 'Grace Period' : 'Detention Time'}
      </Text>

      {/* Earnings Display */}
      <View style={styles.earningsContainer}>
        <Text style={[styles.earningsValue, { color: colors.money }]}>
          {earningsFormatted}
        </Text>
        <Text style={[styles.earningsLabel, { color: themeColors.textSecondary }]}>
          {isInGracePeriod ? 'Billable after grace period' : 'Current Earnings'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    marginTop: 8,
  },
  earningsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  earningsValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
  },
  earningsLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 4,
  },
});
