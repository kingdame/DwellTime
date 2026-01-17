/**
 * Fleet Tab - Fleet Management Dashboard
 * Only visible for fleet admins
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import {
  useFleetStore,
  useCurrentFleet,
  useIsFleetAdmin,
  useFleetSummary,
  FleetDashboard,
} from '../../src/features/fleet';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';

export default function FleetTab() {
  const theme = colors.dark;
  const router = useRouter();

  // Get real user ID
  const userId = useCurrentUserId();
  const user = useCurrentUser();

  const currentFleet = useCurrentFleet();
  const isAdmin = useIsFleetAdmin();
  const { data: summary } = useFleetSummary(currentFleet?.id || null);
  const { isLoading, setRefreshing, isRefreshing } = useFleetStore();

  const [error, setError] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger refetch of fleet data
      // The actual refetch would be handled by React Query in production
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing]);

  const handleInviteDriver = useCallback(() => {
    router.push('/fleet/drivers');
  }, [router]);

  const handleViewEvents = useCallback(() => {
    router.push('/fleet/events');
  }, [router]);

  const handleCreateInvoice = useCallback(() => {
    router.push('/fleet/invoices');
  }, [router]);

  const handleViewDrivers = useCallback(() => {
    router.push('/fleet/drivers');
  }, [router]);

  const handleViewSettings = useCallback(() => {
    router.push('/fleet/settings');
  }, [router]);

  // Not a fleet admin - show access denied
  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorEmoji]}>R</Text>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          Access Restricted
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          Fleet management is only available for fleet administrators.
        </Text>
      </View>
    );
  }

  // No fleet selected
  if (!currentFleet) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorEmoji]}>F</Text>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          No Fleet Selected
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          Create or join a fleet to access fleet management features.
        </Text>
      </View>
    );
  }

  // Loading state
  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading fleet data...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorEmoji]}>!</Text>
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
          Something went wrong
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Fleet</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Manage your team
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <FleetDashboard
          fleet={currentFleet}
          summary={summary ?? null}
          isLoading={isLoading}
          onInviteDriver={handleInviteDriver}
          onViewEvents={handleViewEvents}
          onCreateInvoice={handleCreateInvoice}
          onViewDrivers={handleViewDrivers}
          onViewSettings={handleViewSettings}
        />
      </ScrollView>
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
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
