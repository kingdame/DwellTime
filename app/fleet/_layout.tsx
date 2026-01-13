/**
 * Fleet Stack Navigator Layout
 * Handles navigation within fleet management screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';

export default function FleetLayout() {
  const theme = colors.dark;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: theme.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="drivers"
        options={{
          title: 'Drivers',
          headerBackTitle: 'Fleet',
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: 'Events',
          headerBackTitle: 'Fleet',
        }}
      />
      <Stack.Screen
        name="invoices"
        options={{
          title: 'Team Invoices',
          headerBackTitle: 'Fleet',
        }}
      />
      <Stack.Screen
        name="driver/[id]"
        options={{
          title: 'Driver Details',
          headerBackTitle: 'Drivers',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Fleet Settings',
          headerBackTitle: 'Fleet',
        }}
      />
      <Stack.Screen
        name="invite"
        options={{
          title: 'Join Fleet',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
