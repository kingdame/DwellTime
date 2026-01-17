/**
 * HistoryList Component
 * Displays list of detention records with loading and empty states
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { colors } from '@/constants/colors';
import { useDetentionHistory as useDetentionHistoryConvex } from '@/shared/hooks/convex';
import { useCurrentUserId } from '@/features/auth';
import { HistoryCard } from './HistoryCard';
import type { Id } from '@/convex/_generated/dataModel';

// DetentionRecord type for this component
export interface DetentionRecord {
  id: string;
  facilityName: string;
  facilityAddress?: string;
  eventType: 'pickup' | 'delivery';
  loadReference?: string;
  arrivalTime: string;
  departureTime?: string;
  totalElapsedMinutes: number;
  gracePeriodMinutes: number;
  detentionMinutes: number;
  hourlyRate: number;
  detentionAmount: number;
  notes?: string;
  verificationCode: string;
  photoCount: number;
}

interface HistoryListProps {
  onRecordPress?: (record: DetentionRecord) => void;
}

export function HistoryList({ onRecordPress }: HistoryListProps) {
  const theme = colors.dark;
  const userId = useCurrentUserId() as Id<"users"> | undefined;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use Convex hook for real-time data
  const historyResult = useDetentionHistoryConvex(userId, { limit: 100 });
  const isLoading = historyResult === undefined;
  const isError = false; // Convex handles errors differently

  // Transform Convex data to DetentionRecord format (historyResult.events is the array)
  const records: DetentionRecord[] = (historyResult?.events || []).map((event) => ({
    id: event._id,
    facilityName: event.facilityName || 'Unknown Facility',
    facilityAddress: undefined,
    eventType: event.eventType || 'delivery',
    loadReference: event.loadReference,
    arrivalTime: new Date(event.arrivalTime).toISOString(),
    departureTime: event.departureTime ? new Date(event.departureTime).toISOString() : undefined,
    totalElapsedMinutes: event.totalElapsedMinutes || 0,
    gracePeriodMinutes: event.gracePeriodMinutes || 120,
    detentionMinutes: event.detentionMinutes || 0,
    hourlyRate: event.hourlyRate || 75,
    detentionAmount: event.totalAmount || 0,
    notes: event.notes,
    verificationCode: event.verificationCode || '',
    photoCount: 0,
  }));

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Convex data is real-time, but we can trigger a visual refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading history...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Failed to load history
        </Text>
        <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
          Pull down to retry
        </Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No records yet
        </Text>
        <Text style={[styles.emptyHint, { color: theme.textDisabled }]}>
          Start tracking to see your history
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HistoryCard
          record={item}
          onPress={onRecordPress ? () => onRecordPress(item) : undefined}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

/**
 * Compact summary card for the history tab header
 */
export function HistorySummaryCard({
  totalEarnings,
  totalSessions,
  label = 'This Month',
}: {
  totalEarnings: number;
  totalSessions: number;
  label?: string;
}) {
  const theme = colors.dark;

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
        {label}
      </Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.success }]}>
            ${totalEarnings.toFixed(2)}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Earned
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
            {totalSessions}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Sessions
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
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
  listContent: {
    paddingBottom: 20,
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
});

export default HistoryList;
