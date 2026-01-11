/**
 * Sign In Screen
 * Email and password authentication
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';
import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography } from '@/constants';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useUIStore();
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  const handleSignIn = async () => {
    if (!email || !password) {
      showToast({ type: 'error', message: 'Please enter email and password' });
      return;
    }

    try {
      clearError();
      await signIn(email, password);
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Sign in failed',
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              DwellTime
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Track detention. Generate invoices. Get paid.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.card,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.divider,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={themeColors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.card,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.divider,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={themeColors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {error && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.timer }]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={[styles.linkText, { color: colors.timer }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
              Don't have an account?
            </Text>
            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.timer }]}>
                  {' '}
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as '500',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: typography.fontSize.base,
  },
});
