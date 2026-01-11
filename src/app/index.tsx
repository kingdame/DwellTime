import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to tabs - auth handling is done in _layout.tsx
  return <Redirect href="/(tabs)" />;
}
