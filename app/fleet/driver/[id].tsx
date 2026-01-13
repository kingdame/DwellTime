/**
 * Driver Detail Screen
 * Full screen view of driver information and performance metrics
 */

import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../../src/constants/colors';
import {
  useFleetMembers,
  useFleetEvents,
  useCurrentFleet,
} from '../../../src/features/fleet';
import type { DetentionEvent } from '../../../src/shared/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default function DriverDetailScreen() {
  const theme = colors.dark;
  const { id } = useLocalSearchParams<{ id: string }>();

  const currentFleet = useCurrentFleet();
  const { data: membersData } = useFleetMembers(currentFleet?.id || null);
  const { data: allEvents = [], isLoading } = useFleetEvents(currentFleet?.id || '');

  // Find the driver
  const driver = useMemo(() => {
    return (membersData || []).find((m: any) => m.id === id);
  }, [membersData, id]);

  // Get driver's events
  const driverEvents = useMemo(() => {
    if (!driver) return [];
    return allEvents.filter((e) => e.user_id === driver.user_id);
  }, [allEvents, driver]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (driverEvents.length === 0) {
      return {
        totalEvents: 0,
        totalAmount: 0,
        totalMinutes: 0,
        averageWaitMinutes: 0,
      };
    }

    const totalMinutes = driverEvents.reduce((sum, e) => sum + e.detention_minutes, 0);
    return {
      totalEvents: driverEvents.length,
      totalAmount: driverEvents.reduce((sum, e) => sum + e.total_amount, 0),
      totalMinutes,
      averageWaitMinutes: Math.round(totalMinutes / driverEvents.length),
    };
  }, [driverEvents]);

  const renderEventItem = ({ item }: { item: DetentionEvent }) => (
    <View style={[styles.eventCard, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={styles.eventHeader}>
        <Text style={[styles.eventFacility, { color: theme.textPrimary }]} numberOfLines={1}>
          {(item as any).facility_name || 'Unknown Facility'}
        </Text>
        <Text style={[styles.eventDate, { color: theme.textSecondary }]}>
          {formatDate(item.arrival_time)}
        </Text>
      </View>
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Text style={[styles.eventDetailLabel, { color: theme.textDisabled }]}>Duration</Text>
          <Text style={[styles.eventDetailValue, { color: theme.warning }]}>
            {formatDuration(item.detention_minutes)}
          </Text>
        </View>
        <View style={styles.eventDetail}>
          <Text style={[styles.eventDetailLabel, { color: theme.textDisabled }]}>Amount</Text>
          <Text style={[styles.eventDetailValue, { color: theme.success }]}>
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorEmoji]}>?</Text>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Driver Not Found</Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          This driver may have been removed from the fleet.
        </Text>
      </View>
    );
  }

  const displayName = driver.user?.name || driver.user?.email || 'Unknown Driver';
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: '#D1FAE5', text: '#065F46' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    suspended: { bg: '#FEE2E2', text: '#991B1B' },
    removed: { bg: '#E5E7EB', text: '#374151' },
  };
  const status = statusColors[driver.status] || statusColors.active;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={driverEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        ListEmptyComponent={
          <View style={styles.emptyEvents}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No detention events recorded yet
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Driver Info Card */}
            <View style={[styles.driverCard, { backgroundColor: theme.card }]}>
              <View style={styles.driverHeader}>
                <View style={styles.driverInitial}>
                  <Text style={styles.initialText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                    {displayName}
                  </Text>
                  <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.text }]}>
                        {driver.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[styles.badgeText, { color: '#1E40AF' }]}>
                        {driver.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Metrics Card */}
            <View style={[styles.metricsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.metricsTitle, { color: theme.textPrimary }]}>
                Performance Metrics
              </Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: theme.primary }]}>
                    {metrics.totalEvents}
                  </Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Events</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: theme.success }]}>
                    {formatCurrency(metrics.totalAmount)}
                  </Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Earnings</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: theme.warning }]}>
                    {formatDuration(metrics.totalMinutes)}
                  </Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Wait</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
                    {formatDuration(metrics.averageWaitMinutes)}
                  </Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Avg Wait</Text>
                </View>
              </View>
            </View>

            {/* Events Section Header */}
            <View style={styles.eventsHeader}>
              <Text style={[styles.eventsTitle, { color: theme.textPrimary }]}>Events</Text>
              <Text style={[styles.eventsCount, { color: theme.textSecondary }]}>
                {driverEvents.length} total
              </Text>
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  driverCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInitial: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  initialText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventsCount: {
    fontSize: 13,
  },
  eventCard: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventFacility: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    fontSize: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  eventDetail: {
    alignItems: 'center',
  },
  eventDetailLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  eventDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
