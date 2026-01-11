/**
 * History Screen
 * List of past detention events
 */

import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography } from '@/constants';

export default function HistoryScreen() {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          History
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Your detention events
        </Text>
      </View>

      {/* Summary Stats */}
      <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.money }]}>$0</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Total Earned
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
              0
            </Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Events
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
              0h
            </Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Total Time
            </Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon, { color: themeColors.textSecondary }]}>
          ◇
        </Text>
        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
          No Events Yet
        </Text>
        <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
          Start tracking detention at a facility to see your history here.
          Each event will show time, earnings, and evidence.
        </Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as '700',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    marginTop: 4,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold as '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
});
