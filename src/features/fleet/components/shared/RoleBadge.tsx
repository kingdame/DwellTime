/**
 * RoleBadge Component
 * Displays user role as a styled badge
 */

import { View, Text, StyleSheet } from 'react-native';
import type { FleetRole } from '../../types';

interface RoleBadgeProps {
  role: FleetRole | string;
  size?: 'small' | 'medium';
}

interface RoleConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export function getRoleConfig(role: string): RoleConfig {
  switch (role) {
    case 'admin':
      return { label: 'Admin', bgColor: '#DBEAFE', textColor: '#1E40AF' };
    case 'driver':
      return { label: 'Driver', bgColor: '#E5E7EB', textColor: '#374151' };
    default:
      return { label: role, bgColor: '#E5E7EB', textColor: '#374151' };
  }
}

export function RoleBadge({ role, size = 'medium' }: RoleBadgeProps) {
  const config = getRoleConfig(role);
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
