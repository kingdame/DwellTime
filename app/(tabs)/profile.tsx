/**
 * Profile Tab - User settings and account
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
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

// Mock user ID for now (would come from auth context)
const MOCK_USER_ID = 'demo-user-id';

// Default user values for demo mode
const DEFAULT_USER = {
  id: MOCK_USER_ID,
  name: 'Demo Driver',
  email: 'demo@dwelltime.app',
  phone: null,
  company_name: null,
  hourly_rate: 50,
  grace_period_minutes: 120,
  invoice_terms: null,
  invoice_logo_url: null,
  subscription_tier: 'free' as const,
  stripe_customer_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function ProfileTab() {
  const theme = colors.dark;

  // In production, this would come from auth store
  const user = DEFAULT_USER; // Using demo user for now

  const [showDetentionModal, setShowDetentionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { percentage } = useProfileCompletion(user);

  const handleExportData = useCallback(() => {
    Alert.alert(
      'Export Data',
      'Export all your detention records and invoices?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Coming Soon', 'Visit the History tab to export your data');
          },
        },
      ]
    );
  }, []);

  const handleHelp = useCallback(() => {
    Alert.alert(
      'Help & Support',
      'Need assistance?\n\nEmail: support@dwelltime.app\n\nVisit our website for FAQs and guides.',
      [{ text: 'OK' }]
    );
  }, []);

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

        <Pressable style={[styles.menuItem, { backgroundColor: theme.card }]}>
          <Text style={styles.menuIcon}>📜</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Terms & Privacy</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
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
  version: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 24,
  },
});
