/**
 * AgingBucketCard Component
 * Displays a single aging bucket with count and amount
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { AgingBucketSummary } from '@/shared/types/recovery';

interface AgingBucketCardProps {
  bucket: AgingBucketSummary;
  onPress?: () => void;
  isSelected?: boolean;
}

export function AgingBucketCard({
  bucket,
  onPress,
  isSelected,
}: AgingBucketCardProps) {
  const theme = colors.dark;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.card },
        isSelected && { borderColor: bucket.color, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: bucket.color }]} />

      <View style={styles.content}>
        <Text style={[styles.count, { color: theme.textPrimary }]}>
          {bucket.count}
        </Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {bucket.bucket === 'current'
            ? '0-14 days'
            : bucket.bucket === 'aging'
            ? '15-30 days'
            : bucket.bucket === 'overdue'
            ? '31-60 days'
            : '60+ days'}
        </Text>
      </View>

      <Text style={[styles.amount, { color: bucket.color }]}>
        {formatCurrency(bucket.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
