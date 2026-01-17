/**
 * Invoice Routes Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';

export default function InvoiceLayout() {
  const theme = colors.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="send" />
    </Stack>
  );
}
