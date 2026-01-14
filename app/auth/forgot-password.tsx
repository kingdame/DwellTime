/**
 * Forgot Password Screen
 */

import { useState } from 'react';
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
import { colors } from '../../src/constants/colors';
import { supabase } from '../../src/shared/lib/supabase';

export default function ForgotPassword() {
  const theme = colors.dark;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              Check your email
            </Text>
            <Text style={[styles.successText, { color: theme.textSecondary }]}>
              We've sent a password reset link to {email}
            </Text>
          </View>

          <Link href="/auth/sign-in" asChild>
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]}>
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
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
            Enter your email to receive a reset link
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
