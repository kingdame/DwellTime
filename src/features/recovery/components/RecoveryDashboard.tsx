/**
 * RecoveryDashboard Component
 * Main dashboard showing recovery stats, ROI, and aging overview
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';
import { useRecoverySummary, useROICalculation } from '../hooks/useRecoveryStats';
import { useAgingBuckets, useRemindersDue } from '../hooks/useInvoiceAging';
import { ROICard } from './ROICard';
import { StatCard } from './StatCard';
import { AgingBucketCard } from './AgingBucketCard';

interface RecoveryDashboardProps {
  onBucketPress?: (bucket: string) => void;
}

export function RecoveryDashboard({ onBucketPress }: RecoveryDashboardProps) {
  const theme = colors.dark;
  const { summary, isLoading, error } = useRecoverySummary();
  const roi = useROICalculation();
  const buckets = useAgingBuckets();
  const { data: remindersDue } = useRemindersDue();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading recovery data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorIcon]}>!</Text>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          Unable to load data
        </Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Please try again later.
        </Text>
      </View>
    );
  }

  const hasData = summary && summary.invoiceCount.total > 0;

  if (!hasData) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          No Recovery Data Yet
        </Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Send your first invoice to start tracking your detention recovery and
          ROI.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ROI Card - Hero Section */}
      {roi && <ROICard roi={roi} />}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Collection Rate"
          value={`${summary.collectionRate || 0}%`}
          color={
            summary.collectionRate >= 70
              ? theme.success
              : summary.collectionRate >= 40
              ? theme.warning
              : theme.error
          }
          size="medium"
        />
        <StatCard
          label="Avg Days to Pay"
          value={summary.avgDaysToPayment?.toFixed(0) || 'N/A'}
          subValue={summary.avgDaysToPayment ? 'days' : 'No data'}
          size="medium"
        />
      </View>

      {/* Reminders Due Alert */}
      {remindersDue && remindersDue.length > 0 && (
        <View
          style={[
            styles.alertCard,
            { backgroundColor: theme.warning + '15' },
          ]}
        >
          <Text style={[styles.alertIcon]}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: theme.warning }]}>
              {remindersDue.length} Invoice{remindersDue.length > 1 ? 's' : ''}{' '}
              Due for Reminder
            </Text>
            <Text style={[styles.alertText, { color: theme.textSecondary }]}>
              Tap to view and send follow-up reminders
            </Text>
          </View>
        </View>
      )}

      {/* Aging Overview */}
      <View style={styles.agingSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          AGING OVERVIEW
        </Text>
        {buckets.length > 0 ? (
          buckets.map((bucket) => (
            <AgingBucketCard
              key={bucket.bucket}
              bucket={bucket}
              onPress={() => onBucketPress?.(bucket.bucket)}
            />
          ))
        ) : (
          <View style={[styles.noAgingCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.noAgingIcon]}>✓</Text>
            <Text style={[styles.noAgingText, { color: theme.textPrimary }]}>
              No pending invoices!
            </Text>
            <Text
              style={[styles.noAgingSubtext, { color: theme.textSecondary }]}
            >
              All your invoices have been paid.
            </Text>
          </View>
        )}
      </View>

      {/* Invoice Summary */}
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          INVOICE SUMMARY
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Total Invoices
            </Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {summary.invoiceCount.total}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Paid
            </Text>
            <Text style={[styles.summaryValue, { color: theme.success }]}>
              {summary.invoiceCount.paid}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Pending
            </Text>
            <Text style={[styles.summaryValue, { color: theme.warning }]}>
              {summary.invoiceCount.pending}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Total Documented
            </Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {formatCurrency(summary.documented)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertText: {
    fontSize: 12,
    marginTop: 2,
  },
  agingSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  noAgingCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  noAgingIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#22C55E',
  },
  noAgingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noAgingSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  summarySection: {
    gap: 8,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D3A',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D3A',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
