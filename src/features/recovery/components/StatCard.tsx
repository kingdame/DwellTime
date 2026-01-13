/**
 * StatCard Component
 * Displays a single statistic with label and optional trend
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  color,
  size = 'medium',
}: StatCardProps) {
  const theme = colors.dark;

  const getTrendColor = () => {
    if (!trend) return theme.textSecondary;
    if (trend === 'up') return theme.success;
    if (trend === 'down') return theme.error;
    return theme.textSecondary;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const valueFontSize = size === 'large' ? 32 : size === 'medium' ? 24 : 18;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>

      <Text
        style={[
          styles.value,
          { color: color || theme.textPrimary, fontSize: valueFontSize },
        ]}
      >
        {value}
      </Text>

      {subValue && (
        <Text style={[styles.subValue, { color: theme.textSecondary }]}>
          {subValue}
        </Text>
      )}

      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendIcon, { color: getTrendColor() }]}>
            {getTrendIcon()}
          </Text>
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontWeight: '700',
  },
  subValue: {
    fontSize: 12,
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});
