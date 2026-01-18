/**
 * Help Stack Navigator Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';

export default function HelpLayout() {
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Help & Support',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
