/**
 * Auth Layout
 * Layout for authentication screens (sign-in, sign-up, forgot-password)
 */

import { Stack } from 'expo-router';

import { useUIStore } from '@/shared/stores/uiStore';
import { colors } from '@/constants';

export default function AuthLayout() {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark
            ? colors.dark.background
            : colors.light.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
