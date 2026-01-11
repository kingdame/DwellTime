/**
 * Auth Layout - Stack navigation for auth screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';

export default function AuthLayout() {
  const theme = colors.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
