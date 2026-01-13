/**
 * DriverList Component
 * Displays list of fleet drivers with pull-to-refresh and empty state
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
import { DriverCard } from './DriverCard';
import type { FleetMember, MemberStatus, FleetRole } from '../types';

export interface DriverListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  role: FleetRole;
  eventsCount?: number;
  earningsThisMonth?: number;
  truckNumber?: string | null;
}

interface DriverListProps {
  drivers: DriverListItem[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onDriverPress: (driver: DriverListItem) => void;
}

type FilterStatus = 'all' | MemberStatus;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

// Loading skeleton component
function DriverSkeleton() {
  const theme = colors.dark;

  return (
    <View style={[styles.skeletonCard, { backgroundColor: theme.card }]}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonLine, styles.skeletonName, { backgroundColor: theme.divider }]} />
        <View style={[styles.skeletonBadge, { backgroundColor: theme.divider }]} />
      </View>
      <View style={[styles.skeletonLine, styles.skeletonContact, { backgroundColor: theme.divider }]} />
      <View style={[styles.skeletonLine, styles.skeletonContact, { backgroundColor: theme.divider }]} />
      <View style={styles.skeletonStats}>
        <View style={[styles.skeletonStat, { backgroundColor: theme.divider }]} />
        <View style={[styles.skeletonStat, { backgroundColor: theme.divider }]} />
      </View>
    </View>
  );
}

export function DriverList({
  drivers,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onDriverPress,
}: DriverListProps) {
  const theme = colors.dark;
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredDrivers = filter === 'all'
    ? drivers
    : drivers.filter((d) => d.status === filter);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const renderItem = useCallback(
    ({ item }: { item: DriverListItem }) => (
      <DriverCard driver={item} onPress={() => onDriverPress(item)} />
    ),
    [onDriverPress]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>D</Text>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        No Drivers
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {filter === 'all'
          ? 'Invite your first driver to start tracking detention events together'
          : `No ${filter} drivers found`}
      </Text>
    </View>
  );

  // Show loading skeletons
  if (isLoading) {
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

        {/* Loading Skeletons */}
        <View style={styles.loadingContainer}>
          <DriverSkeleton />
          <DriverSkeleton />
          <DriverSkeleton />
        </View>
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

      {/* Driver Summary */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
          {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` (${filter})`}
        </Text>
      </View>

      {/* Driver List */}
      <FlatList
        data={filteredDrivers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
  summaryContainer: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Skeleton styles
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonLine: {
    borderRadius: 4,
  },
  skeletonName: {
    width: '60%',
    height: 18,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  skeletonContact: {
    width: '80%',
    height: 14,
    marginBottom: 8,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
  },
  skeletonStat: {
    width: 60,
    height: 36,
    borderRadius: 8,
  },
});
