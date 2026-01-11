/**
 * Sign Up Screen
 * New user registration
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
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';
import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography } from '@/constants';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useUIStore();
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      showToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      showToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    try {
      clearError();
      await signUp(email, password, name);
      showToast({
        type: 'success',
        message: 'Account created! Please check your email to verify.',
      });
      router.replace('/auth/sign-in');
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Sign up failed',
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Start tracking detention and getting paid
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
                placeholder="Full Name"
                placeholderTextColor={themeColors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
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
                autoComplete="new-password"
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
                placeholder="Confirm Password"
                placeholderTextColor={themeColors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              {error && (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {error}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.timer }]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                Already have an account?
              </Text>
              <Link href="/auth/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={[styles.linkText, { color: colors.timer }]}>
                    {' '}
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
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
  linkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as '500',
  },
});
