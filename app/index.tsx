/**
 * Root Index - Auth Routing
 * Redirects based on authentication state
 */

import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/constants/colors';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const theme = colors.dark;

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
