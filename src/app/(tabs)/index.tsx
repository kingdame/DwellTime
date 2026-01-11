/**
 * Home Screen
 * Main dashboard with detention tracking status
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';
import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography, config } from '@/constants';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

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

      {/* Status Card - Not Tracking */}
      <View style={[styles.statusCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.statusHeader}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: themeColors.textSecondary },
            ]}
          />
          <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
            Not Tracking
          </Text>
        </View>

        <Text style={[styles.statusDescription, { color: themeColors.textSecondary }]}>
          Start tracking when you arrive at a facility to document detention time
        </Text>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.timer }]}
          onPress={() => {
            // TODO: Implement start tracking
          }}
        >
          <Text style={styles.startButtonText}>Start Tracking</Text>
        </TouchableOpacity>
      </View>

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
    fontWeight: typography.fontWeight.bold as '700',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  statusDescription: {
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
  startButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as '600',
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
    fontWeight: typography.fontWeight.bold as '700',
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
    fontWeight: typography.fontWeight.semibold as '600',
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
    fontWeight: typography.fontWeight.medium as '500',
  },
});
