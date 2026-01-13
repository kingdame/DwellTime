/**
 * DriverDetailModal Component
 * View-only modal displaying driver information and detention events
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { StatusBadge, RoleBadge, getStatusConfig, formatCurrency, formatCurrencyPrecise, formatDate, formatDuration } from './shared';
import { styles } from './DriverDetailModal.styles';
import type { MemberStatus, FleetRole } from '../types';
import type { DetentionEvent } from '@/shared/types';

interface DriverDetailModalProps {
  visible: boolean;
  onClose: () => void;
  driver: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: MemberStatus;
    role: FleetRole;
    truckNumber?: string | null;
    joinedAt?: string | null;
  } | null;
  events: DetentionEvent[];
  metrics?: {
    totalEvents: number;
    totalAmount: number;
    totalMinutes: number;
    averageWaitMinutes: number;
  };
  isLoading?: boolean;
}

function getEventStatusColors(status: string) {
  switch (status) {
    case 'paid':
      return { bg: '#D1FAE5', text: '#065F46' };
    case 'invoiced':
      return { bg: '#DBEAFE', text: '#1E40AF' };
    default:
      return { bg: '#FEF3C7', text: '#92400E' };
  }
}

export function DriverDetailModal({
  visible,
  onClose,
  driver,
  events,
  metrics,
  isLoading = false,
}: DriverDetailModalProps) {
  const theme = colors.dark;

  const renderEventItem = useCallback(
    ({ item }: { item: DetentionEvent }) => {
      const statusColors = getEventStatusColors(item.status);
      return (
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
              <Text style={[styles.eventDetailLabel, { color: theme.textDisabled }]}>Type</Text>
              <Text style={[styles.eventDetailValue, { color: theme.textSecondary }]}>
                {item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1)}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Text style={[styles.eventDetailLabel, { color: theme.textDisabled }]}>Duration</Text>
              <Text style={[styles.eventDetailValue, { color: theme.warning }]}>
                {formatDuration(item.detention_minutes)}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Text style={[styles.eventDetailLabel, { color: theme.textDisabled }]}>Amount</Text>
              <Text style={[styles.eventDetailValue, { color: theme.success }]}>
                {formatCurrencyPrecise(item.total_amount)}
              </Text>
            </View>
          </View>
          <View style={styles.eventStatus}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [theme]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No detention events recorded yet
      </Text>
    </View>
  );

  if (!driver) return null;

  const statusConfig = getStatusConfig(driver.status);
  const displayName = driver.name || driver.email || 'Unknown Driver';

  const renderHeader = () => (
    <>
      {/* Driver Info Card */}
      <View style={[styles.driverCard, { backgroundColor: theme.card }]}>
        <View style={styles.driverHeader}>
          <View style={styles.driverInitial}>
            <Text style={styles.initialText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: theme.textPrimary }]}>{displayName}</Text>
            <View style={styles.driverBadges}>
              <StatusBadge status={driver.status} />
              <RoleBadge role={driver.role} />
            </View>
          </View>
        </View>

        <View style={[styles.driverDetails, { borderTopColor: theme.divider }]}>
          {driver.email && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>Email</Text>
              <Text style={[styles.detailValue, { color: theme.textSecondary }]}>{driver.email}</Text>
            </View>
          )}
          {driver.phone && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>Phone</Text>
              <Text style={[styles.detailValue, { color: theme.textSecondary }]}>{driver.phone}</Text>
            </View>
          )}
          {driver.truckNumber && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>Truck #</Text>
              <Text style={[styles.detailValue, { color: theme.textSecondary }]}>{driver.truckNumber}</Text>
            </View>
          )}
          {driver.joinedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textDisabled }]}>Joined</Text>
              <Text style={[styles.detailValue, { color: theme.textSecondary }]}>{formatDate(driver.joinedAt)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Performance Metrics */}
      {metrics && (
        <View style={[styles.metricsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.metricsTitle, { color: theme.textPrimary }]}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.primary }]}>{metrics.totalEvents}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Events</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.success }]}>{formatCurrency(metrics.totalAmount)}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Earnings</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.warning }]}>{formatDuration(metrics.totalMinutes)}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Wait</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{formatDuration(metrics.averageWaitMinutes)}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Avg Wait</Text>
            </View>
          </View>
        </View>
      )}

      {/* Events Section Header */}
      <View style={styles.eventsHeader}>
        <Text style={[styles.eventsTitle, { color: theme.textPrimary }]}>Detention Events</Text>
        <Text style={[styles.eventsCount, { color: theme.textSecondary }]}>{events.length} events</Text>
      </View>
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Driver Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            ListEmptyComponent={renderEmpty}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
