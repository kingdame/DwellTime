/**
 * StatusBadge Component
 * Reusable badge for displaying status indicators
 */

import { View, Text, StyleSheet } from 'react-native';

export type StatusType = 'active' | 'pending' | 'suspended' | 'removed' | 'completed' | 'invoiced' | 'paid';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'small' | 'medium';
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'active':
      return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
    case 'pending':
      return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
    case 'suspended':
      return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
    case 'removed':
      return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
    case 'completed':
      return { label: 'Completed', bgColor: '#FEF3C7', textColor: '#92400E' };
    case 'invoiced':
      return { label: 'Invoiced', bgColor: '#E0E7FF', textColor: '#3730A3' };
    case 'paid':
      return { label: 'Paid', bgColor: '#D1FAE5', textColor: '#065F46' };
    default:
      return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
  }
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: config.textColor },
          isSmall && styles.badgeTextSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 10,
  },
});
