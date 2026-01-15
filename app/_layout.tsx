/**
 * Root Layout
 * Wrapped with ConvexProvider for real-time database access
 */

import { ConvexProvider } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { colors } from '../src/constants/colors';
import { convex } from '../src/shared/lib/convex';

export default function RootLayout() {
  const theme = colors.dark;

  return (
    <ConvexProvider client={convex}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="fleet" options={{ headerShown: false }} />
        </Stack>
      </View>
    </ConvexProvider>
  );
}
