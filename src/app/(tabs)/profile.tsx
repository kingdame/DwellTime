/**
 * Profile Screen
 * User profile and settings
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store';
import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography, config } from '@/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme, showToast } = useUIStore();
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast({ type: 'success', message: 'Signed out successfully' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to sign out' });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.timer },
              ]}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
            {user?.name || 'Driver'}
          </Text>
          <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
            {user?.email || 'Not signed in'}
          </Text>
          <View
            style={[
              styles.tierBadge,
              {
                backgroundColor:
                  user?.subscription_tier === 'pro'
                    ? colors.money
                    : themeColors.divider,
              },
            ]}
          >
            <Text style={styles.tierText}>
              {user?.subscription_tier?.toUpperCase() || 'FREE'}
            </Text>
          </View>
        </View>

        {/* Detention Settings */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Detention Settings
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeColors.textSecondary }]}>
              Hourly Rate
            </Text>
            <Text style={[styles.settingValue, { color: colors.money }]}>
              ${user?.hourly_rate ?? config.detention.defaultHourlyRate}/hr
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeColors.textSecondary }]}>
              Grace Period
            </Text>
            <Text style={[styles.settingValue, { color: themeColors.textPrimary }]}>
              {user?.grace_period_minutes ?? config.detention.defaultGracePeriodMinutes}{' '}
              minutes
            </Text>
          </View>
        </View>

        {/* App Settings */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            App Settings
          </Text>

          <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
            <Text style={[styles.settingLabel, { color: themeColors.textSecondary }]}>
              Theme
            </Text>
            <Text style={[styles.settingValue, { color: themeColors.textPrimary }]}>
              {isDark ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Invoice Settings */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Invoice Settings
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: themeColors.textSecondary }]}>
              Company Name
            </Text>
            <Text style={[styles.settingValue, { color: themeColors.textPrimary }]}>
              {user?.company_name || 'Not set'}
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: themeColors.error }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: themeColors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: themeColors.textSecondary }]}>
          DwellTime v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as '700',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold as '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
  },
  settingValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as '500',
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as '500',
  },
  version: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: 32,
  },
});
