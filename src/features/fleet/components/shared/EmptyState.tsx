/**
 * EmptyState Component
 * Reusable empty state display for lists
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon = 'X', title, subtitle }: EmptyStateProps) {
  const theme = colors.dark;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
