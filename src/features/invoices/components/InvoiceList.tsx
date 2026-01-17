/**
 * InvoiceList Component
 * Displays list of invoices with filtering
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useInvoices, useInvoiceSummary } from '../hooks/useInvoicesConvex';
import { InvoiceCard } from './InvoiceCard';
import type { Invoice } from '@/shared/types';
import type { Id } from '@/convex/_generated/dataModel';

interface InvoiceListProps {
  userId: string;
  onInvoicePress: (invoice: Invoice) => void;
}

type FilterStatus = 'all' | Invoice['status'];

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function InvoiceSummaryCard({ userId }: { userId: string }) {
  const theme = colors.dark;
  // Convex hook returns data directly or undefined while loading
  const summary = useInvoiceSummary(userId);
  const isLoading = summary === undefined;

  if (isLoading || !summary) {
    return (
      <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: theme.textDisabled }]}>
          {formatCurrency(summary.amountDraft)}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
          Draft ({summary.totalDraft})
        </Text>
      </View>
      <View style={[styles.summaryDivider, { backgroundColor: theme.divider }]} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: theme.warning }]}>
          {formatCurrency(summary.amountSent)}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
          Outstanding ({summary.totalSent})
        </Text>
      </View>
      <View style={[styles.summaryDivider, { backgroundColor: theme.divider }]} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: theme.success }]}>
          {formatCurrency(summary.amountPaid)}
        </Text>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
          Collected ({summary.totalPaid})
        </Text>
      </View>
    </View>
  );
}

export function InvoiceList({ userId, onInvoicePress }: InvoiceListProps) {
  const theme = colors.dark;
  const [filter, setFilter] = useState<FilterStatus>('all');

  // Convex hook returns data directly
  const invoices = useInvoices(userId as Id<"users"> | undefined, filter === 'all' ? undefined : filter);
  const isLoading = invoices === undefined;
  const isError = false; // Convex doesn't expose error state directly
  const isRefetching = false; // Convex auto-updates

  const handleRefresh = useCallback(() => {
    // Convex auto-syncs, no manual refetch needed
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Invoice }) => (
      <InvoiceCard invoice={item} onPress={() => onInvoicePress(item)} />
    ),
    [onInvoicePress]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📄</Text>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        No Invoices
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {filter === 'all'
          ? 'Create your first invoice from completed detention records'
          : `No ${filter} invoices found`}
      </Text>
    </View>
  );

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Failed to load invoices
        </Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={[styles.retryText, { color: theme.primary }]}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              filter === option.value && {
                backgroundColor: theme.primary,
              },
            ]}
            onPress={() => setFilter(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.textSecondary },
                filter === option.value && { color: '#fff' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invoice List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
