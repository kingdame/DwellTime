/**
 * Home Screen
 * Main dashboard with detention tracking status
 */

import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';
import { useUIStore } from '@/shared/stores/uiStore';
import { useDetentionTimer, StatusCard } from '@/features/detention';
import { colors, typography, config } from '@/constants';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const timer = useDetentionTimer();

  const themeColors = isDark ? colors.dark : colors.light;

  const handleStartTracking = () => {
    timer.startTimer(
      new Date(),
      user?.grace_period_minutes ?? config.detention.defaultGracePeriodMinutes,
      user?.hourly_rate ?? config.detention.defaultHourlyRate
    );
  };

  const handleStopTracking = () => {
    Alert.alert(
      'End Detention',
      'Are you sure you want to end this detention event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Detention',
          style: 'destructive',
          onPress: () => {
            const result = timer.stopTimer();
            if (result) {
              Alert.alert(
                'Detention Ended',
                `Total detention: ${Math.round(result.detentionMinutes)} minutes\nAmount: $${result.totalAmount.toFixed(2)}`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>
          Welcome back,
        </Text>
        <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
          {user?.name || 'Driver'}
        </Text>
      </View>

      {/* Status Card */}
      <StatusCard
        timerState={timer}
        isDark={isDark}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
      />

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.statValue, { color: colors.money }]}>$0</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            This Month
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>0</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Events
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>0h</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Total Time
          </Text>
        </View>
      </View>

      {/* Settings Summary */}
      <View style={[styles.settingsCard, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.settingsTitle, { color: themeColors.textPrimary }]}>
          Your Settings
        </Text>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingsLabel, { color: themeColors.textSecondary }]}>
            Hourly Rate
          </Text>
          <Text style={[styles.settingsValue, { color: colors.money }]}>
            ${user?.hourly_rate ?? config.detention.defaultHourlyRate}/hr
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingsLabel, { color: themeColors.textSecondary }]}>
            Grace Period
          </Text>
          <Text style={[styles.settingsValue, { color: themeColors.textPrimary }]}>
            {user?.grace_period_minutes ?? config.detention.defaultGracePeriodMinutes} min
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: typography.fontSize.base,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingsLabel: {
    fontSize: typography.fontSize.base,
  },
  settingsValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
});
