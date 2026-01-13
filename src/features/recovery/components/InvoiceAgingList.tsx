/**
 * InvoiceAgingList Component
 * Displays list of aging invoices grouped by bucket
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import {
  AgingInvoice,
  AgingBucket,
  AGING_COLORS,
} from '@/shared/types/recovery';
import {
  useAgingInvoices,
  useAgingBuckets,
  useMarkPaid,
} from '../hooks/useInvoiceAging';
import { AgingBucketCard } from './AgingBucketCard';

interface InvoiceAgingListProps {
  onInvoicePress?: (invoice: AgingInvoice) => void;
  onSendReminder?: (invoice: AgingInvoice) => void;
}

export function InvoiceAgingList({
  onInvoicePress,
  onSendReminder,
}: InvoiceAgingListProps) {
  const theme = colors.dark;
  const { data: invoices, isLoading } = useAgingInvoices();
  const buckets = useAgingBuckets();
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkPaid();

  const [selectedBucket, setSelectedBucket] = useState<AgingBucket | null>(
    null
  );

  const filteredInvoices = selectedBucket
    ? invoices?.filter((inv) => inv.aging_bucket === selectedBucket)
    : invoices;

  const handleMarkPaid = useCallback(
    (invoice: AgingInvoice) => {
      Alert.alert(
        'Mark as Paid',
        `Mark invoice ${invoice.invoice_number} as paid for $${invoice.amount_invoiced.toFixed(2)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Full Payment',
            onPress: () =>
              markPaid({
                trackingId: invoice.id,
                amountReceived: invoice.amount_invoiced,
              }),
          },
          {
            text: 'Partial Payment',
            onPress: () => {
              Alert.prompt(
                'Enter Amount Received',
                'Enter the partial payment amount:',
                (amount) => {
                  const parsed = parseFloat(amount);
                  if (!isNaN(parsed) && parsed > 0) {
                    markPaid({ trackingId: invoice.id, amountReceived: parsed });
                  }
                },
                'plain-text',
                invoice.amount_invoiced.toFixed(2)
              );
            },
          },
        ]
      );
    },
    [markPaid]
  );

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderInvoiceItem = ({ item }: { item: AgingInvoice }) => (
    <TouchableOpacity
      style={[styles.invoiceCard, { backgroundColor: theme.card }]}
      onPress={() => onInvoicePress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={[styles.invoiceNumber, { color: theme.textPrimary }]}>
            {item.invoice_number}
          </Text>
          {item.facility_name && (
            <Text style={[styles.facilityName, { color: theme.textSecondary }]}>
              {item.facility_name}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.agingBadge,
            { backgroundColor: AGING_COLORS[item.aging_bucket] + '20' },
          ]}
        >
          <Text
            style={[
              styles.agingBadgeText,
              { color: AGING_COLORS[item.aging_bucket] },
            ]}
          >
            {item.days_outstanding} days
          </Text>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Amount
          </Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {formatCurrency(item.amount_invoiced)}
          </Text>
        </View>

        {item.recipient_email && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Sent to
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {item.recipient_email}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Reminders
          </Text>
          <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
            {item.reminder_count} sent
          </Text>
        </View>
      </View>

      <View style={styles.invoiceActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => handleMarkPaid(item)}
          disabled={isMarkingPaid}
        >
          <Text style={styles.actionButtonText}>Mark Paid</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.warning + '20' },
          ]}
          onPress={() => onSendReminder?.(item)}
        >
          <Text style={[styles.actionButtonText, { color: theme.warning }]}>
            Send Reminder
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Loading invoices...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bucket filters */}
      <View style={styles.bucketSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          AGING BUCKETS
        </Text>
        {buckets.map((bucket) => (
          <AgingBucketCard
            key={bucket.bucket}
            bucket={bucket}
            isSelected={selectedBucket === bucket.bucket}
            onPress={() =>
              setSelectedBucket(
                selectedBucket === bucket.bucket ? null : bucket.bucket
              )
            }
          />
        ))}
      </View>

      {/* Invoice list */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {selectedBucket
            ? `${selectedBucket.toUpperCase()} INVOICES`
            : 'ALL PENDING INVOICES'}
        </Text>

        {filteredInvoices && filteredInvoices.length > 0 ? (
          <FlatList
            data={filteredInvoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No pending invoices in this category.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bucketSection: {
    marginBottom: 24,
  },
  listSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  invoiceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  facilityName: {
    fontSize: 13,
    marginTop: 2,
  },
  agingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  agingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
