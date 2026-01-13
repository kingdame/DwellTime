/**
 * ROICard Component
 * Displays ROI calculation and value proposition
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { ROICalculation } from '@/shared/types/recovery';

interface ROICardProps {
  roi: ROICalculation;
}

export function ROICard({ roi }: ROICardProps) {
  const theme = colors.dark;

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isPositiveROI = roi.net_gain > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Your ROI
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isPositiveROI ? theme.success + '20' : theme.error + '20' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isPositiveROI ? theme.success : theme.error },
            ]}
          >
            {roi.roi_multiplier}x Return
          </Text>
        </View>
      </View>

      <View style={styles.mainStat}>
        <Text style={[styles.mainValue, { color: theme.success }]}>
          {formatCurrency(roi.total_collected)}
        </Text>
        <Text style={[styles.mainLabel, { color: theme.textSecondary }]}>
          Total Collected
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {formatCurrency(roi.total_documented)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Documented
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.warning }]}>
            {formatCurrency(roi.pending_amount)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Pending
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>
            {roi.collection_rate}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Collection Rate
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>
            Subscription Cost
          </Text>
          <Text style={[styles.footerValue, { color: theme.textPrimary }]}>
            {formatCurrency(roi.subscription_cost)}/mo
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>
            Net Gain
          </Text>
          <Text
            style={[
              styles.footerValue,
              { color: isPositiveROI ? theme.success : theme.error },
            ]}
          >
            {isPositiveROI ? '+' : ''}
            {formatCurrency(roi.net_gain)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainStat: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  mainLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D3A',
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    padding: 12,
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerLabel: {
    fontSize: 13,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
