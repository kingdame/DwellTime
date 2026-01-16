/**
 * Sign Up Screen
 * Uses Clerk for authentication with email verification
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
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { colors } from '../../src/constants/colors';

export default function SignUp() {
  const router = useRouter();
  const theme = colors.dark;
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Redirect if already signed in - using useEffect to avoid hooks order issues
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the sign up
      await signUp.create({
        emailAddress: email,
        password,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || undefined,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      // Show verification input
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to sign up';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, confirmPassword, fullName, signUp]);

  const handleVerification = useCallback(async () => {
    if (!isLoaded || !verificationCode) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('Verification status:', result.status);
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Verification failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router]);

  // Verification code input screen
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>Verify Email</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We sent a verification code to {email}
            </Text>
          </View>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Verification Code
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: theme.divider,
                    textAlign: 'center',
                    fontSize: 24,
                    letterSpacing: 8,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={theme.textDisabled}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleVerification}
              disabled={loading || verificationCode.length < 6}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => setPendingVerification(false)}
            >
              <Text style={[styles.linkText, { color: theme.primary }]}>
                Go back
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>DwellTime</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Create your account
            </Text>
          </View>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Full Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: theme.divider,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textDisabled}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: theme.divider,
                  },
                ]}
                placeholder="Create a password (min 8 chars)"
                placeholderTextColor={theme.textDisabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Confirm Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.textPrimary,
                    borderColor: theme.divider,
                  },
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.textDisabled}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/auth/sign-in" asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: theme.primary }]}>
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    textAlign: 'center',
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
