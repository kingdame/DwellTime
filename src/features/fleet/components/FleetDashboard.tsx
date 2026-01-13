/**
 * FleetDashboard Component
 * Main admin dashboard for fleet management
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { FleetMetricsCard } from './FleetMetricsCard';
import type { Fleet } from '../types';
import type { FleetSummary } from '../services/fleetService';

interface FleetDashboardProps {
  fleet: Fleet;
  summary: FleetSummary | null;
  isLoading?: boolean;
  onInviteDriver: () => void;
  onViewEvents: () => void;
  onCreateInvoice: () => void;
  onViewDrivers: () => void;
  onViewSettings: () => void;
}

export function FleetDashboard({
  fleet,
  summary,
  isLoading = false,
  onInviteDriver,
  onViewEvents,
  onCreateInvoice,
  onViewDrivers,
  onViewSettings,
}: FleetDashboardProps) {
  const theme = colors.dark;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Fleet Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.fleetName, { color: theme.textPrimary }]}>
            {fleet.name}
          </Text>
          {fleet.company_name && (
            <Text style={[styles.companyName, { color: theme.textSecondary }]}>
              {fleet.company_name}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.card }]}
          onPress={onViewSettings}
        >
          <Text style={[styles.settingsIcon, { color: theme.textSecondary }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Card */}
      <View style={styles.metricsSection}>
        <FleetMetricsCard
          totalDrivers={summary?.total_drivers ?? 0}
          activeDrivers={summary?.active_drivers ?? 0}
          pendingDrivers={summary?.pending_invitations ?? 0}
          eventsThisMonth={summary?.events_this_month ?? 0}
          earningsThisMonth={summary?.amount_this_month ?? 0}
          pendingInvoicesAmount={summary?.unpaid_invoice_amount ?? 0}
          isLoading={isLoading}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={onInviteDriver}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Text style={styles.actionIcon}>+</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
              Invite Driver
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
              Add a new team member
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={onViewEvents}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: theme.warning + '20' }]}>
              <Text style={styles.actionIcon}>E</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
              View Events
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
              See all detention events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={onCreateInvoice}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: theme.success + '20' }]}>
              <Text style={styles.actionIcon}>$</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
              Create Invoice
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
              Generate team invoice
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={onViewDrivers}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: theme.textSecondary + '20' }]}>
              <Text style={styles.actionIcon}>D</Text>
            </View>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
              Manage Drivers
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
              View team members
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Facilities Summary */}
      {summary?.top_facilities && summary.top_facilities.length > 0 && (
        <View style={styles.facilitiesSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Top Facilities
          </Text>
          <View style={[styles.facilitiesCard, { backgroundColor: theme.card }]}>
            {summary.top_facilities.slice(0, 5).map((facility, index) => (
              <View
                key={facility.facility_id}
                style={[
                  styles.facilityRow,
                  index < summary.top_facilities.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.divider,
                  },
                ]}
              >
                <View style={styles.facilityInfo}>
                  <Text
                    style={[styles.facilityName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {facility.facility_name}
                  </Text>
                  <Text style={[styles.facilityStats, { color: theme.textSecondary }]}>
                    {facility.event_count} events
                  </Text>
                </View>
                <Text style={[styles.facilityWait, { color: theme.warning }]}>
                  {Math.round(facility.total_wait_minutes / facility.event_count)}m avg
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  fleetName: {
    fontSize: 28,
    fontWeight: '700',
  },
  companyName: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  settingsIcon: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricsSection: {
    marginBottom: 24,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
  },
  facilitiesSection: {
    marginBottom: 24,
  },
  facilitiesCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  facilityInfo: {
    flex: 1,
    marginRight: 12,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  facilityStats: {
    fontSize: 12,
  },
  facilityWait: {
    fontSize: 14,
    fontWeight: '600',
  },
});
