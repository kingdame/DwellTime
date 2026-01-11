/**
 * StatusCard Component
 * Shows current tracking status with appropriate actions
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '@/constants';
import { TimerDisplay } from './TimerDisplay';
import type { DetentionTimerState } from '../hooks/useDetentionTimer';

interface StatusCardProps {
  timerState: DetentionTimerState;
  isDark: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

export function StatusCard({
  timerState,
  isDark,
  onStartTracking,
  onStopTracking,
}: StatusCardProps) {
  const themeColors = isDark ? colors.dark : colors.light;
  const isActive = timerState.isActive;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: isActive ? colors.timer : themeColors.textSecondary },
          ]}
        />
        <Text style={[styles.statusText, { color: isActive ? colors.timer : themeColors.textSecondary }]}>
          {isActive ? 'Tracking Active' : 'Not Tracking'}
        </Text>
      </View>

      {/* Content based on state */}
      {isActive ? (
        <>
          <TimerDisplay
            elapsedFormatted={timerState.elapsedFormatted}
            detentionFormatted={timerState.detentionFormatted}
            earningsFormatted={timerState.earningsFormatted}
            isInGracePeriod={timerState.isInGracePeriod}
            isDark={isDark}
          />
          <TouchableOpacity
            style={[styles.stopButton, { backgroundColor: colors.danger }]}
            onPress={onStopTracking}
          >
            <Text style={styles.buttonText}>End Detention</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.description, { color: themeColors.textSecondary }]}>
            Start tracking when you arrive at a facility to document detention time
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.timer }]}
            onPress={onStartTracking}
          >
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.fontSize.base,
    marginBottom: 16,
    lineHeight: 22,
  },
  startButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
});
