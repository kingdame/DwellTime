/**
 * Profile Tab - User settings and account
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../src/constants/colors';

export default function ProfileTab() {
  const theme = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>
          Not signed in
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          Sign in to sync your data
        </Text>
      </View>

      <ScrollView style={styles.menuList}>
        <Pressable style={[styles.menuItem, { backgroundColor: theme.card }]}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Settings</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable style={[styles.menuItem, { backgroundColor: theme.card }]}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Export Data</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable style={[styles.menuItem, { backgroundColor: theme.card }]}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Help & Support</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable style={[styles.menuItem, { backgroundColor: theme.card }]}>
          <Text style={styles.menuIcon}>📜</Text>
          <Text style={[styles.menuText, { color: theme.textPrimary }]}>Terms & Privacy</Text>
          <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
        </Pressable>
      </ScrollView>

      <Text style={[styles.version, { color: theme.textDisabled }]}>
        DwellTime v1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 36,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuList: {
    flex: 1,
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
    paddingVertical: 16,
  },
});
