/**
 * PaymentReliabilityCard Component
 * Displays facility payment reliability score and stats
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import { useFacilityPaymentStats } from '../hooks/useFacilitiesConvex';
import type { Id } from '@/convex/_generated/dataModel';

interface PaymentReliabilityCardProps {
  facilityId: string;
  compact?: boolean;
}

export function PaymentReliabilityCard({
  facilityId,
  compact = false,
}: PaymentReliabilityCardProps) {
  const theme = colors.dark;
  // Convex hooks return data directly or undefined while loading
  const paymentStats = useFacilityPaymentStats(facilityId as Id<"facilities"> | undefined);
  const isLoading = paymentStats === undefined;
  
  // Transform payment stats to reliability format
  const reliability = paymentStats ? {
    paymentRate: paymentStats.paymentRate,
    avgPaymentDays: paymentStats.avgPaymentDays,
    totalReports: paymentStats.totalReports,
    reliability: paymentStats.paymentRate >= 90 ? 'excellent' as const :
                 paymentStats.paymentRate >= 75 ? 'good' as const :
                 paymentStats.paymentRate >= 50 ? 'fair' as const :
                 paymentStats.totalReports > 0 ? 'poor' as const : 'unknown' as const,
    reliabilityColor: paymentStats.paymentRate >= 90 ? colors.dark.success :
                      paymentStats.paymentRate >= 75 ? colors.dark.primary :
                      paymentStats.paymentRate >= 50 ? colors.dark.warning :
                      colors.dark.danger,
  } : null;

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.compact, { backgroundColor: theme.card }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (!reliability || reliability.reliability === 'unknown') {
    return (
      <View style={[styles.container, compact && styles.compact, { backgroundColor: theme.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>
            Payment Reliability
          </Text>
        </View>
        <Text style={[styles.unknownText, { color: theme.textSecondary }]}>
          Not enough data yet
        </Text>
        {!compact && (
          <Text style={[styles.helperText, { color: theme.textDisabled }]}>
            Report your payment outcomes to help other drivers
          </Text>
        )}
      </View>
    );
  }

  const reliabilityLabel = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unknown: 'Unknown',
  }[reliability.reliability];

  return (
    <View style={[styles.container, compact && styles.compact, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>
          Payment Reliability
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: reliability.reliabilityColor + '20' },
          ]}
        >
          <Text style={[styles.badgeText, { color: reliability.reliabilityColor }]}>
            {reliabilityLabel}
          </Text>
        </View>
      </View>

      <View style={styles.mainStat}>
        <Text style={[styles.percentage, { color: reliability.reliabilityColor }]}>
          {reliability.paymentRate?.toFixed(0) || 0}%
        </Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          get paid
        </Text>
      </View>

      {!compact && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {reliability.avgDaysToPayment?.toFixed(0) || 'N/A'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              avg days
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {reliability.totalClaims}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              reports
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Inline payment badge for compact display
 */
export function PaymentReliabilityBadge({
  facilityId,
}: {
  facilityId: string;
}) {
  const theme = colors.dark;
  const { data: reliability, isLoading } = useFacilityReliability(facilityId);

  if (isLoading || !reliability || reliability.reliability === 'unknown') {
    return null;
  }

  return (
    <View
      style={[
        styles.inlineBadge,
        { backgroundColor: reliability.reliabilityColor + '20' },
      ]}
    >
      <Text style={[styles.inlineBadgeText, { color: reliability.reliabilityColor }]}>
        {reliability.paymentRate?.toFixed(0)}% pay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  compact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  percentage: {
    fontSize: 32,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
  },
  unknownText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D3A',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
