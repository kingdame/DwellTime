/**
 * DriverCard Component
 * Displays individual driver information with status and metrics
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import type { FleetMember, MemberStatus, FleetRole } from '../types';

interface DriverCardProps {
  driver: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: MemberStatus;
    role: FleetRole;
    eventsCount?: number;
    earningsThisMonth?: number;
    truckNumber?: string | null;
  };
  onPress: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusConfig(status: MemberStatus): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', bgColor: '#D1FAE5', textColor: '#065F46' };
    case 'pending':
      return { label: 'Pending', bgColor: '#FEF3C7', textColor: '#92400E' };
    case 'suspended':
      return { label: 'Suspended', bgColor: '#FEE2E2', textColor: '#991B1B' };
    case 'removed':
      return { label: 'Removed', bgColor: '#E5E7EB', textColor: '#374151' };
    default:
      return { label: status, bgColor: '#E5E7EB', textColor: '#374151' };
  }
}

function getRoleConfig(role: FleetRole): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (role) {
    case 'admin':
      return { label: 'Admin', bgColor: '#DBEAFE', textColor: '#1E40AF' };
    case 'driver':
      return { label: 'Driver', bgColor: '#E5E7EB', textColor: '#374151' };
    default:
      return { label: role, bgColor: '#E5E7EB', textColor: '#374151' };
  }
}

export function DriverCard({ driver, onPress }: DriverCardProps) {
  const theme = colors.dark;
  const statusConfig = getStatusConfig(driver.status);
  const roleConfig = getRoleConfig(driver.role);

  const displayName = driver.name || driver.email || 'Unknown Driver';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with name and badges */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text
            style={[styles.name, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {driver.truckNumber && (
            <Text style={[styles.truckNumber, { color: theme.textSecondary }]}>
              Truck #{driver.truckNumber}
            </Text>
          )}
        </View>
        <View style={styles.badges}>
          <View
            style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}
          >
            <Text style={[styles.badgeText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: roleConfig.bgColor }]}
          >
            <Text style={[styles.badgeText, { color: roleConfig.textColor }]}>
              {roleConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        {driver.phone && (
          <Text style={[styles.contactText, { color: theme.textSecondary }]}>
            {driver.phone}
          </Text>
        )}
        {driver.email && (
          <Text
            style={[styles.contactText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {driver.email}
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { borderTopColor: theme.divider }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {driver.eventsCount ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textDisabled }]}>
            Events
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.success }]}>
            {formatCurrency(driver.earningsThisMonth ?? 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textDisabled }]}>
            This Month
          </Text>
        </View>
      </View>

      {/* View Details Indicator */}
      <View style={styles.viewDetails}>
        <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
          View Details
        </Text>
      </View>
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
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  truckNumber: {
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactText: {
    fontSize: 13,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
  },
  viewDetails: {
    alignItems: 'center',
    paddingTop: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
