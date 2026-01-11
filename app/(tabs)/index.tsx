/**
 * Home Tab - Main detention tracking screen
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../src/constants/colors';
import { StatusCard, DetentionTimerState } from '../../src/features/detention/components';
import { useDetentionStore } from '../../src/features/detention/store';

// Format milliseconds to HH:MM:SS
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format currency
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Grace period in ms (2 hours)
const GRACE_PERIOD_MS = 2 * 60 * 60 * 1000;
// Hourly rate after grace period
const HOURLY_RATE = 50;

export default function HomeTab() {
  const theme = colors.dark;
  const { isTracking, startTime, facilityName, startTracking, stopTracking } = useDetentionStore();
  
  const [timerState, setTimerState] = useState<DetentionTimerState>({
    isActive: false,
    startTime: null,
    elapsedMs: 0,
    elapsedFormatted: '00:00:00',
    detentionMs: 0,
    detentionFormatted: '00:00:00',
    earningsFormatted: '$0.00',
    isInGracePeriod: true,
  });

  // Update timer every second when tracking
  useEffect(() => {
    if (!isTracking || !startTime) {
      setTimerState({
        isActive: false,
        startTime: null,
        elapsedMs: 0,
        elapsedFormatted: '00:00:00',
        detentionMs: 0,
        detentionFormatted: '00:00:00',
        earningsFormatted: '$0.00',
        isInGracePeriod: true,
      });
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const isInGracePeriod = elapsedMs < GRACE_PERIOD_MS;
      const detentionMs = isInGracePeriod ? 0 : elapsedMs - GRACE_PERIOD_MS;
      const earningsHours = detentionMs / (1000 * 60 * 60);
      const earnings = earningsHours * HOURLY_RATE;

      setTimerState({
        isActive: true,
        startTime: new Date(startTime),
        elapsedMs,
        elapsedFormatted: formatTime(elapsedMs),
        detentionMs,
        detentionFormatted: formatTime(detentionMs),
        earningsFormatted: formatCurrency(earnings),
        isInGracePeriod,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const handleStartTracking = () => {
    // For demo, use a placeholder facility
    startTracking('demo-facility', 'Demo Facility');
  };

  const handleStopTracking = () => {
    stopTracking();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>DwellTime</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isTracking ? `At: ${facilityName}` : 'Track your detention time'}
        </Text>
      </View>

      <StatusCard
        timerState={timerState}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
      />

      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>
          Today's Summary
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.success }]}>$0.00</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>0h 0m</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Time</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
