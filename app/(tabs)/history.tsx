/**
 * History Tab - View detention records
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../src/constants/colors';

export default function HistoryTab() {
  const theme = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your detention records
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
          This Month
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.success }]}>$0.00</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Total Earned
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>0</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Sessions
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.list}>
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No records yet
          </Text>
          <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
            Start tracking to see your history
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
  },
});
