/**
 * Subscription Stack Navigator Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';

export default function SubscriptionLayout() {
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
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Choose Your Plan',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
