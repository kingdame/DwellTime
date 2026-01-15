/**
 * Forgot Password Screen
 * Uses Clerk for password reset
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { colors } from '../../src/constants/colors';

export default function ForgotPassword() {
  const theme = colors.dark;
  const { signIn, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Password reset flow state
  const [pendingReset, setPendingReset] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = useCallback(async () => {
    if (!isLoaded) return;

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Start the password reset flow
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      setPendingReset(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, signIn]);

  const handleVerifyAndReset = useCallback(async () => {
    if (!isLoaded || !code || !newPassword) return;

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        setSuccess(true);
      } else {
        setError('Password reset incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || 'Verification failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, newPassword, signIn]);

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              Password Reset!
            </Text>
            <Text style={[styles.successText, { color: theme.textSecondary }]}>
              Your password has been successfully reset. You can now sign in.
            </Text>
          </View>

          <Link href="/auth/sign-in" asChild>
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]}>
              <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  // Enter new password screen
  if (pendingReset) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>Enter Code</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We sent a reset code to {email}
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
                Reset Code
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
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                New Password
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
                placeholder="Enter new password (min 8 chars)"
                placeholderTextColor={theme.textDisabled}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleVerifyAndReset}
              disabled={loading || code.length < 6 || newPassword.length < 8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => setPendingReset(false)}
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter your email to receive a reset code
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

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Link href="/auth/sign-in" asChild>
            <Pressable>
              <Text style={[styles.footerLink, { color: theme.primary }]}>
                ← Back to Sign In
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  successBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
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
    alignItems: 'center',
    marginTop: 40,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
