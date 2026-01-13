/**
 * FleetMetricsCard Component
 * Displays summary statistics for a fleet
 */

import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

interface FleetMetricsCardProps {
  totalDrivers: number;
  activeDrivers: number;
  pendingDrivers: number;
  eventsThisMonth: number;
  earningsThisMonth: number;
  pendingInvoicesAmount: number;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FleetMetricsCard({
  totalDrivers,
  activeDrivers,
  pendingDrivers,
  eventsThisMonth,
  earningsThisMonth,
  pendingInvoicesAmount,
  isLoading = false,
}: FleetMetricsCardProps) {
  const theme = colors.dark;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Top Row - Drivers and Events */}
      <View style={styles.row}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.primary }]}>
            {totalDrivers}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Total Drivers
          </Text>
          <View style={styles.subMetrics}>
            <Text style={[styles.subMetricText, { color: theme.success }]}>
              {activeDrivers} active
            </Text>
            {pendingDrivers > 0 && (
              <Text style={[styles.subMetricText, { color: theme.warning }]}>
                {' '}/{' '}{pendingDrivers} pending
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {eventsThisMonth}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Events This Month
          </Text>
        </View>
      </View>

      {/* Bottom Row - Earnings and Pending */}
      <View style={[styles.row, styles.bottomRow, { borderTopColor: theme.divider }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.success }]}>
            {formatCurrency(earningsThisMonth)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Earnings This Month
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.warning }]}>
            {formatCurrency(pendingInvoicesAmount)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            Pending Invoices
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bottomRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subMetrics: {
    flexDirection: 'row',
    marginTop: 4,
  },
  subMetricText: {
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 50,
    marginHorizontal: 16,
  },
});
