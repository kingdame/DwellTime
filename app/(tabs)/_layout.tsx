/**
 * Tab Navigation Layout
 * Protected with Clerk authentication
 */

import { Tabs, Redirect } from 'expo-router';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { colors } from '../../src/constants/colors';
import { useIsFleetAdmin } from '../../src/features/fleet';

// Simple icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    facilities: '🏢',
    history: '📋',
    invoices: '💰',
    profile: '👤',
    fleet: '👥',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name] || '•'}
    </Text>
  );
}

export default function TabLayout() {
  const theme = colors.dark;
  const { isSignedIn, isLoaded } = useAuth();
  const isFleetAdmin = useIsFleetAdmin();

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.divider,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: 'Facilities',
          tabBarIcon: ({ focused }) => <TabIcon name="facilities" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="history" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ focused }) => <TabIcon name="invoices" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ focused }) => <TabIcon name="fleet" focused={focused} />,
          // Hide the Fleet tab for non-admin users
          href: isFleetAdmin ? '/fleet' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
