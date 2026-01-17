/**
 * Driver Management Screen
 * Lists all fleet drivers with invite functionality
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import {
  useFleetStore,
  useCurrentFleet,
  useFleetMembers,
  useCreateInvitation,
  DriverList,
  InviteDriverModal,
  type DriverListItem,
} from '../../src/features/fleet';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';

export default function DriversScreen() {
  const theme = colors.dark;
  const router = useRouter();

  const currentFleet = useCurrentFleet();
  const userId = useCurrentUserId();
  const user = useCurrentUser();
  const { data: membersData } = useFleetMembers(currentFleet?.id || null);
  const { isLoading, isRefreshing, setRefreshing } = useFleetStore();
  const createInvitation = useCreateInvitation();

  const [showInviteModal, setShowInviteModal] = useState(false);

  // Transform fleet members to driver list items
  const drivers: DriverListItem[] = useMemo(() => {
    return (membersData || []).map((member: any) => ({
      id: member.id,
      name: member.user?.name || null,
      email: member.user?.email || null,
      phone: member.user?.phone || null,
      status: member.status,
      role: member.role,
      eventsCount: 0, // Would come from metrics in production
      earningsThisMonth: 0,
      truckNumber: (member as any).truck_number || null,
    }));
  }, [membersData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger refetch - would use React Query in production
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing]);

  const handleDriverPress = useCallback(
    (driver: DriverListItem) => {
      router.push(`/fleet/driver/${driver.id}`);
    },
    [router]
  );

  const handleInvite = useCallback(
    async (data: { email: string; phone?: string; role: 'admin' | 'driver' }) => {
      if (!currentFleet || !userId) return;

      const result = await createInvitation.mutateAsync({
        fleetId: currentFleet.id,
        invitedBy: userId,
        input: {
          email: data.email,
          role: data.role,
        },
      });

      return { invitationCode: result?.invitation_code };
    },
    [currentFleet, createInvitation, userId]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <DriverList
          drivers={drivers}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onDriverPress={handleDriverPress}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowInviteModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Invite Driver Modal */}
      <InviteDriverModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        fleetName={currentFleet?.name || 'Fleet'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
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
