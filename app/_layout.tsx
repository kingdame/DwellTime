/**
 * Root Layout
 * Wrapped with ClerkProvider for authentication, ConvexProvider for real-time database,
 * and QueryClientProvider for TanStack Query
 */

import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { colors } from '../src/constants/colors';
import { convex } from '../src/shared/lib/convex';
import { tokenCache, clerkPublishableKey } from '../src/shared/lib/clerk';
import { queryClient } from '../src/shared/lib/queryClient';
import { useAuthSync } from '../src/features/auth';

/**
 * Auth sync component - syncs Clerk user to Convex
 */
function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook syncs Clerk auth state with Convex user database
  useAuthSync();
  return <>{children}</>;
}

/**
 * Main app content wrapped with providers
 */
function AppContent() {
  const theme = colors.dark;

  return (
    <AuthSyncProvider>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
            animation: 'slide_from_right',
          }}
        >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="fleet" options={{ headerShown: false }} />
        <Stack.Screen name="recovery" options={{ headerShown: false }} />
        <Stack.Screen name="invoice" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        </Stack>
      </View>
    </AuthSyncProvider>
  );
}

export default function RootLayout() {
  // Check if Clerk is configured
  if (!clerkPublishableKey) {
    console.warn(
      'Clerk publishable key not found. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment.'
    );
    // Fall back to unauthenticated mode for development
    return (
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ClerkLoaded>
            <AppContent />
          </ClerkLoaded>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
