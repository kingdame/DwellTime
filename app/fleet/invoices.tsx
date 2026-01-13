/**
 * Team Invoices Screen
 * Create and manage fleet invoices
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../../src/constants/colors';
import {
  useFleetStore,
  useCurrentFleet,
  useFleetMembers,
  useFleetInvoices,
  useFleetEvents,
  useCreateFleetInvoice,
  TeamInvoiceModal,
} from '../../src/features/fleet';
import type { FleetInvoice } from '../../src/features/fleet/services/fleetInvoiceService';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function InvoiceCard({ invoice }: { invoice: FleetInvoice }) {
  const theme = colors.dark;

  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#FEF3C7', text: '#92400E' },
    sent: { bg: '#DBEAFE', text: '#1E40AF' },
    paid: { bg: '#D1FAE5', text: '#065F46' },
    void: { bg: '#E5E7EB', text: '#374151' },
  };

  const status = statusColors[invoice.status] || statusColors.draft;

  return (
    <View style={[styles.invoiceCard, { backgroundColor: theme.card }]}>
      <View style={styles.invoiceHeader}>
        <Text style={[styles.invoiceNumber, { color: theme.textPrimary }]}>
          {invoice.invoice_number}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {invoice.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceDetails}>
        <Text style={[styles.invoiceDate, { color: theme.textSecondary }]}>
          {formatDate(invoice.created_at)}
        </Text>
        <Text style={[styles.invoiceAmount, { color: theme.success }]}>
          {formatCurrency(invoice.total_amount)}
        </Text>
      </View>
    </View>
  );
}

export default function TeamInvoicesScreen() {
  const theme = colors.dark;

  const currentFleet = useCurrentFleet();
  const { data: membersData } = useFleetMembers(currentFleet?.id || null);
  const { isRefreshing, setRefreshing } = useFleetStore();
  const createInvoice = useCreateFleetInvoice();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch invoices
  const {
    data: invoices = [],
    isLoading,
    refetch,
  } = useFleetInvoices(currentFleet?.id || '');

  // Fetch events for invoice creation
  const { data: events = [] } = useFleetEvents(currentFleet?.id || '');

  // Transform data for the modal
  const driversWithEvents = useMemo(() => {
    return (membersData || [])
      .filter((m: any) => m.role === 'driver' && m.status === 'active')
      .map((member: any) => {
        const driverEvents = events.filter(
          (e) => e.user_id === member.user_id && e.status === 'completed'
        );
        return {
          id: member.user_id,
          name: member.user?.name || null,
          email: member.user?.email || null,
          events: driverEvents,
          totalAmount: driverEvents.reduce((sum, e) => sum + e.total_amount, 0),
          eventCount: driverEvents.length,
        };
      });
  }, [membersData, events]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, setRefreshing]);

  const handleCreateInvoice = useCallback(
    async (data: {
      driverIds: string[];
      eventIds: string[];
      dateRange: { start: Date; end: Date };
    }) => {
      if (!currentFleet) return;

      await createInvoice.mutateAsync({
        fleetId: currentFleet.id,
        input: {
          invoiceIds: data.eventIds, // eventIds are really invoice IDs
        },
      });

      await refetch();
    },
    [currentFleet, createInvoice, refetch]
  );

  const renderInvoice = useCallback(
    ({ item }: { item: FleetInvoice }) => <InvoiceCard invoice={item} />,
    []
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>$</Text>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        No Invoices Yet
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        Create your first team invoice to consolidate driver detention earnings.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      />

      {/* Create Invoice Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Invoice Modal */}
      <TeamInvoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateInvoice}
        drivers={driversWithEvents}
        isLoading={createInvoice.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  invoiceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDate: {
    fontSize: 13,
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '400',
  },
});
