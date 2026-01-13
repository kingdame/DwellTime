/**
 * FleetEventsList Component
 * Displays all fleet detention events with filtering options
 */

import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '@/constants/colors';
import { FleetEventCard } from './FleetEventCard';
import { FilterPill, EmptyState } from './shared';
import { styles } from './FleetEventsList.styles';
import type { DetentionEvent } from '@/shared/types';

export interface FleetEventItem extends DetentionEvent {
  facility_name?: string | null;
  driver_name?: string | null;
  driver_email?: string | null;
  driver_id?: string;
}

interface FleetEventsListProps {
  events: FleetEventItem[];
  drivers: Array<{ id: string; name: string | null; email: string | null }>;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

type FilterStatus = 'all' | DetentionEvent['status'];
type FilterDriver = 'all' | string;
type DateRange = 'all' | 'today' | 'week' | 'month';

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
];

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

function isWithinDateRange(dateStr: string, range: DateRange): boolean {
  if (range === 'all') return true;

  const date = new Date(dateStr);
  const now = new Date();

  switch (range) {
    case 'today':
      return date.toDateString() === now.toDateString();
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }
    default:
      return true;
  }
}

export function FleetEventsList({ events, drivers, isLoading = false, isRefreshing = false, onRefresh }: FleetEventsListProps) {
  const theme = colors.dark;
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [driverFilter, setDriverFilter] = useState<FilterDriver>('all');
  const [dateFilter, setDateFilter] = useState<DateRange>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (statusFilter !== 'all' && event.status !== statusFilter) return false;
      if (driverFilter !== 'all' && event.driver_id !== driverFilter) return false;
      if (!isWithinDateRange(event.arrival_time, dateFilter)) return false;
      return true;
    });
  }, [events, statusFilter, driverFilter, dateFilter]);

  const handleRefresh = useCallback(() => onRefresh?.(), [onRefresh]);
  const renderItem = useCallback(({ item }: { item: FleetEventItem }) => <FleetEventCard event={item} />, []);

  const activeFiltersCount = [statusFilter !== 'all', driverFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter('all');
    setDriverFilter('all');
    setDateFilter('all');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading events...</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <EmptyState
      icon="E"
      title="No Events"
      subtitle={
        activeFiltersCount > 0
          ? 'No events match the current filters'
          : 'Detention events from your drivers will appear here'
      }
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.filterToggle, { backgroundColor: theme.card }]} onPress={() => setShowFilters(!showFilters)}>
        <Text style={[styles.filterToggleText, { color: theme.textPrimary }]}>
          Filters{activeFiltersCount > 0 && <Text style={{ color: theme.primary }}> ({activeFiltersCount})</Text>}
        </Text>
        <Text style={[styles.filterToggleIcon, { color: theme.textSecondary }]}>{showFilters ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.card }]}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.filterOptions}>
              {STATUS_OPTIONS.map((option) => (
                <FilterPill key={option.value} label={option.label} isActive={statusFilter === option.value} onPress={() => setStatusFilter(option.value)} />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Driver</Text>
            <View style={styles.filterOptions}>
              <FilterPill label="All" isActive={driverFilter === 'all'} onPress={() => setDriverFilter('all')} />
              {drivers.slice(0, 5).map((driver) => (
                <FilterPill key={driver.id} label={driver.name || driver.email || 'Unknown'} isActive={driverFilter === driver.id} onPress={() => setDriverFilter(driver.id)} />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Date Range</Text>
            <View style={styles.filterOptions}>
              {DATE_OPTIONS.map((option) => (
                <FilterPill key={option.value} label={option.label} isActive={dateFilter === option.value} onPress={() => setDateFilter(option.value)} />
              ))}
            </View>
          </View>

          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
              <Text style={[styles.clearFiltersText, { color: theme.error }]}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}{activeFiltersCount > 0 && ' (filtered)'}
        </Text>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} /> : undefined}
      />
    </View>
  );
}
