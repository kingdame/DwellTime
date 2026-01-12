/**
 * HistoryCard Component
 * Displays a single detention record in the history list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '@/constants/colors';
import {
  type DetentionRecord,
  formatCurrency,
  formatDuration,
  formatDate,
  formatTime,
} from '../services/historyService';

interface HistoryCardProps {
  record: DetentionRecord;
  onPress?: () => void;
}

export function HistoryCard({ record, onPress }: HistoryCardProps) {
  const theme = colors.dark;

  const hasEarnings = record.detentionAmount > 0;
  const isActive = record.status === 'active';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.facilityInfo}>
          <Text style={[styles.facilityName, { color: theme.textPrimary }]} numberOfLines={1}>
            {record.facilityName}
          </Text>
          {record.facilityAddress && (
            <Text style={[styles.facilityAddress, { color: theme.textSecondary }]} numberOfLines={1}>
              {record.facilityAddress}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? theme.warning + '20' : theme.success + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isActive ? theme.warning : theme.success },
            ]}
          >
            {isActive ? 'Active' : 'Completed'}
          </Text>
        </View>
      </View>

      {/* Event Type & Date */}
      <View style={styles.metaRow}>
        <View style={styles.eventType}>
          <Text style={styles.eventEmoji}>
            {record.eventType === 'pickup' ? '📦' : '🚚'}
          </Text>
          <Text style={[styles.eventLabel, { color: theme.textSecondary }]}>
            {record.eventType === 'pickup' ? 'Pickup' : 'Delivery'}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {formatDate(record.arrivalTime)}
        </Text>
      </View>

      {/* Time & Duration */}
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Arrived</Text>
          <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
            {formatTime(record.arrivalTime)}
          </Text>
        </View>
        {record.departureTime && (
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Departed</Text>
            <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
              {formatTime(record.departureTime)}
            </Text>
          </View>
        )}
        <View style={styles.timeBlock}>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Total</Text>
          <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
            {formatDuration(record.totalElapsedMinutes)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Earnings Row */}
      <View style={styles.earningsRow}>
        <View style={styles.earningsInfo}>
          <Text style={[styles.detentionLabel, { color: theme.textSecondary }]}>
            Detention: {formatDuration(record.detentionMinutes)}
          </Text>
          {record.loadReference && (
            <Text style={[styles.loadRef, { color: theme.textDisabled }]} numberOfLines={1}>
              Load: {record.loadReference}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.earningsAmount,
            { color: hasEarnings ? theme.success : theme.textSecondary },
          ]}
        >
          {formatCurrency(record.detentionAmount)}
        </Text>
      </View>

      {/* Photos indicator */}
      {record.photoCount > 0 && (
        <View style={styles.photosIndicator}>
          <Text style={styles.photosIcon}>📷</Text>
          <Text style={[styles.photosCount, { color: theme.textSecondary }]}>
            {record.photoCount} photo{record.photoCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  facilityInfo: {
    flex: 1,
    marginRight: 12,
  },
  facilityName: {
    fontSize: 17,
    fontWeight: '600',
  },
  facilityAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  eventLabel: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 13,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsInfo: {
    flex: 1,
  },
  detentionLabel: {
    fontSize: 13,
  },
  loadRef: {
    fontSize: 12,
    marginTop: 2,
  },
  earningsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  photosIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  photosIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  photosCount: {
    fontSize: 12,
  },
});

export default HistoryCard;
