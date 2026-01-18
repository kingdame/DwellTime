/**
 * Profile Tab - User settings and account
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '../../src/constants/colors';
import {
  EditableSettingRow,
  SettingSectionHeader,
  DetentionSettingsModal,
  InvoiceSettingsModal,
  formatGracePeriod,
  formatHourlyRate,
  useProfileCompletion,
} from '../../src/features/profile';
import { useCurrentUserId, useCurrentUser } from '../../src/features/auth';
import { useUser, useUpdateUser } from '../../src/shared/hooks/convex';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export default function ProfileTab() {
  const theme = colors.dark;
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();

  // Get real user from Convex
  const userId = useCurrentUserId() as Id<"users"> | undefined;
  const convexUser = useUser(userId);
  const updateUser = useUpdateUser();

  const [showDetentionModal, setShowDetentionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Transform Convex user to expected format
  const user = convexUser ? {
    id: convexUser._id,
    name: convexUser.name || null,
    email: convexUser.email,
    phone: convexUser.phone || null,
    company_name: convexUser.companyName || null,
    hourly_rate: convexUser.hourlyRate || 75,
    grace_period_minutes: convexUser.gracePeriodMinutes || 120,
    invoice_terms: convexUser.invoiceTerms || null,
    invoice_logo_url: convexUser.invoiceLogoUrl || null,
    subscription_tier: convexUser.subscriptionTier || 'free',
  } : null;

  const { percentage } = useProfileCompletion(user);

  // Handle sign out - ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/sign-in');
          },
        },
      ]
    );
  }, [signOut, router]);

  // State for export
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = useCallback(async () => {
    if (!userId || isExporting) return;

    Alert.alert(
      'Export Data',
      'Export all your detention records, invoices, and reviews as JSON?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setIsExporting(true);
            try {
              // Fetch export data from Convex
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_CONVEX_URL}/api/query`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    path: 'users:exportUserData',
                    args: { userId },
                  }),
                }
              );
              
              if (!response.ok) {
                throw new Error('Failed to fetch export data');
              }

              const exportData = await response.json();
              const jsonString = JSON.stringify(exportData.value || exportData, null, 2);
              
              // Save to file
              const fileName = `dwelltime-export-${new Date().toISOString().split('T')[0]}.json`;
              const fileUri = `${FileSystem.documentDirectory}${fileName}`;
              
              await FileSystem.writeAsStringAsync(fileUri, jsonString);
              
              // Check if sharing is available
              const isShareAvailable = await Sharing.isAvailableAsync();
              
              if (isShareAvailable) {
                await Sharing.shareAsync(fileUri, {
                  mimeType: 'application/json',
                  dialogTitle: 'Export Your Data',
                });
              } else {
                Alert.alert('Export Complete', `Data saved to ${fileName}`);
              }
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Export Failed', 'Unable to export your data. Please try again later.');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  }, [userId, isExporting]);

  const handleHelp = useCallback(() => {
    router.push('/help');
  }, [router]);

  // Show loading if user not loaded
  if (convexUser === undefined) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isSignedIn || !user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
        </View>
        <View style={[styles.signInPrompt, { backgroundColor: theme.card }]}>
          <Text style={styles.signInIcon}>👤</Text>
          <Text style={[styles.signInText, { color: theme.textPrimary }]}>
            Sign in to access your profile
          </Text>
          <Pressable
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>
            {user.name || 'Not signed in'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user.email || 'Sign in to sync your data'}
          </Text>

          {/* Profile Completion */}
          {percentage < 100 && (
            <View style={styles.completionContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.primary, width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={[styles.completionText, { color: theme.textSecondary }]}>
                Profile {percentage}% complete
              </Text>
            </View>
          )}
        </View>

        {/* Detention Settings */}
        <SettingSectionHeader title="Detention Settings" />

        <EditableSettingRow
          icon="💰"
          label="Hourly Rate"
          value={user.hourly_rate ? formatHourlyRate(user.hourly_rate) : null}
          placeholder="Set your rate"
          onEdit={() => setShowDetentionModal(true)}
        />

        <EditableSettingRow
          icon="⏱️"
          label="Grace Period"
          value={formatGracePeriod(user.grace_period_minutes)}
          onEdit={() => setShowDetentionModal(true)}
        />

        {/* Invoice Settings */}
        <SettingSectionHeader title="Invoice Settings" />

        <EditableSettingRow
          icon="🏢"
          label="Company Name"
          value={user.company_name}
          placeholder="Add company name"
          onEdit={() => setShowInvoiceModal(true)}
        />

        <EditableSettingRow
          icon="📄"
          label="Payment Terms"
          value={user.invoice_terms ? 'Customized' : null}
          placeholder="Set payment terms"
          onEdit={() => setShowInvoiceModal(true)}
        />

        {/* Subscription */}
        <SettingSectionHeader title="Subscription" />

        <Pressable
          style={[styles.upgradeCard, { backgroundColor: theme.primary + '15' }]}
          onPress={() => router.push('/subscription')}
        >
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeIcon}>⭐</Text>
            <View style={styles.upgradeText}>
              <Text style={[styles.upgradeTier, { color: theme.primary }]}>
                {user.subscription_tier === 'free' ? 'Free Plan' : user.subscription_tier.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.upgradeLabel, { color: theme.textSecondary }]}>
                {user.subscription_tier === 'free' ? 'Upgrade to unlock all features' : 'Manage your subscription'}
              </Text>
            </View>
          </View>
          <Text style={[styles.menuArrow, { color: theme.primary }]}>›</Text>
        </Pressable>

        {/* Other Settings */}
        <SettingSectionHeader title="Account" />

        <Pressable
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={handleExportData}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Export Data</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={handleHelp}
        >
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Help & Support</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={() => router.push('/legal')}
        >
          <Text style={styles.menuIcon}>📜</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Terms & Privacy</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        {/* Sign Out Button */}
        <Pressable
          style={[styles.signOutButton, { backgroundColor: theme.error + '20' }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.version, { color: theme.textDisabled }]}>
          DwellTime v1.0.0
        </Text>
      </ScrollView>

      {/* Detention Settings Modal */}
      <DetentionSettingsModal
        visible={showDetentionModal}
        userId={user.id}
        currentHourlyRate={user.hourly_rate || 50}
        currentGracePeriod={user.grace_period_minutes || 120}
        onClose={() => setShowDetentionModal(false)}
      />

      {/* Invoice Settings Modal */}
      <InvoiceSettingsModal
        visible={showInvoiceModal}
        userId={user.id}
        currentCompanyName={user.company_name}
        currentInvoiceTerms={user.invoice_terms}
        onClose={() => setShowInvoiceModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  signInPrompt: {
    margin: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  signInIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  signInText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  completionContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 20,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  upgradeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTier: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  upgradeLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 24,
  },
});
