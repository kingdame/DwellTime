/**
 * Sign In Screen
 * Uses Clerk for authentication
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { colors } from '../../src/constants/colors';

export default function SignIn() {
  const router = useRouter();
  const theme = colors.dark;
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already signed in - using useEffect to avoid hooks order issues
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        // Handle other statuses (e.g., needs_second_factor)
        console.log('Sign in status:', result.status);
        setError('Additional verification required');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>DwellTime</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to your account
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                  borderColor: theme.divider,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textDisabled}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                  borderColor: theme.divider,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </Pressable>

          <Link href="/auth/forgot-password" asChild>
            <Pressable style={styles.linkButton}>
              <Text style={[styles.linkText, { color: theme.primary }]}>
                Forgot password?
              </Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/auth/sign-up" asChild>
            <Pressable>
              <Text style={[styles.footerLink, { color: theme.primary }]}>
                Sign up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
