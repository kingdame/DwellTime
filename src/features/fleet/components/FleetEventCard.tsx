/**
 * FleetEventCard Component
 * Displays a single detention event in the fleet events list (VIEW-ONLY)
 */

import { View, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrencyPrecise, formatDate, formatTime, formatDuration, getStatusConfig } from './shared';
import { styles } from './FleetEventCard.styles';
import type { DetentionEvent } from '@/shared/types';

interface FleetEventCardProps {
  event: DetentionEvent & {
    facility_name?: string | null;
    driver_name?: string | null;
    driver_email?: string | null;
  };
}

export function FleetEventCard({ event }: FleetEventCardProps) {
  const theme = colors.dark;
  const statusConfig = getStatusConfig(event.status);
  const facilityName = event.facility_name || 'Unknown Facility';
  const driverName = event.driver_name || event.driver_email || 'Unknown Driver';

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Header with facility and status */}
      <View style={styles.header}>
        <View style={styles.facilityInfo}>
          <Text style={[styles.facilityName, { color: theme.textPrimary }]} numberOfLines={1}>
            {facilityName}
          </Text>
          <View style={styles.dateInfo}>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(event.arrival_time)}</Text>
            <Text style={[styles.time, { color: theme.textDisabled }]}> at {formatTime(event.arrival_time)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>{statusConfig.label}</Text>
        </View>
      </View>

      {/* Driver Badge */}
      <View style={styles.driverRow}>
        <View style={[styles.driverBadge, { backgroundColor: theme.primary + '20' }]}>
          <View style={styles.driverInitial}>
            <Text style={[styles.initialText, { color: theme.primary }]}>{driverName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.driverName, { color: theme.primary }]} numberOfLines={1}>
            {driverName}
          </Text>
        </View>
        <View style={[styles.eventTypeBadge, { backgroundColor: event.event_type === 'pickup' ? '#FEF3C7' : '#DBEAFE' }]}>
          <Text style={[styles.eventTypeText, { color: event.event_type === 'pickup' ? '#92400E' : '#1E40AF' }]}>
            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={[styles.metricsRow, { borderTopColor: theme.divider }]}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: theme.textDisabled }]}>Duration</Text>
          <Text style={[styles.metricValue, { color: theme.warning }]}>{formatDuration(event.detention_minutes)}</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: theme.textDisabled }]}>Rate</Text>
          <Text style={[styles.metricValue, { color: theme.textSecondary }]}>{formatCurrencyPrecise(event.hourly_rate)}/hr</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: theme.textDisabled }]}>Amount</Text>
          <Text style={[styles.metricValue, { color: theme.success }]}>{formatCurrencyPrecise(event.total_amount)}</Text>
        </View>
      </View>

      {/* Load Reference */}
      {event.load_reference && (
        <View style={[styles.loadRefRow, { borderTopColor: theme.divider }]}>
          <Text style={[styles.loadRefLabel, { color: theme.textDisabled }]}>Load Ref:</Text>
          <Text style={[styles.loadRefValue, { color: theme.textSecondary }]}>{event.load_reference}</Text>
        </View>
      )}

      {/* Notes */}
      {event.notes && (
        <View style={[styles.notesRow, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.notesText, { color: theme.textSecondary }]} numberOfLines={2}>
            {event.notes}
          </Text>
        </View>
      )}
    </View>
  );
}
