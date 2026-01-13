/**
 * Fleet Events Screen
 * VIEW-ONLY display of all fleet detention events
 */

import { useCallback, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../src/constants/colors';
import {
  useFleetStore,
  useCurrentFleet,
  useFleetMembers,
  useFleetEvents,
  FleetEventsList,
  type FleetEventItem,
} from '../../src/features/fleet';

export default function FleetEventsScreen() {
  const theme = colors.dark;

  const currentFleet = useCurrentFleet();
  const { data: membersData } = useFleetMembers(currentFleet?.id || null);
  const { isRefreshing, setRefreshing } = useFleetStore();

  // Fetch fleet events
  const {
    data: events = [],
    isLoading,
    refetch,
  } = useFleetEvents(currentFleet?.id || '');

  // Transform members for the filter dropdown
  const drivers = useMemo(() => {
    return (membersData || [])
      .filter((m: any) => m.role === 'driver')
      .map((m: any) => ({
        id: m.user_id,
        name: m.user?.name || null,
        email: m.user?.email || null,
      }));
  }, [membersData]);

  // Transform events to include driver info
  const eventsWithDetails: FleetEventItem[] = useMemo(() => {
    return events.map((event) => {
      const driver = (membersData || []).find((m: any) => m.user_id === event.user_id);
      return {
        ...event,
        driver_id: event.user_id,
        driver_name: driver?.user?.name || null,
        driver_email: driver?.user?.email || null,
      };
    });
  }, [events, membersData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, setRefreshing]);

  // No fleet selected
  if (!currentFleet) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyEmoji}>F</Text>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          No Fleet Selected
        </Text>
        <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
          Select a fleet to view events.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* View-only indicator */}
      <View style={[styles.viewOnlyBanner, { backgroundColor: theme.card }]}>
        <Text style={[styles.viewOnlyText, { color: theme.textSecondary }]}>
          View Only - Events are recorded by drivers in the field
        </Text>
      </View>

      <View style={styles.content}>
        <FleetEventsList
          events={eventsWithDetails}
          drivers={drivers}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </View>
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
  viewOnlyBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  viewOnlyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
