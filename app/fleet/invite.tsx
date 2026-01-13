/**
 * Invitation Acceptance Screen
 * For drivers accepting fleet invitations
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { useInvitationByCode, useAcceptInvitation } from '../../src/features/fleet';
import { useAuthStore } from '../../src/features/auth/store';

export default function InviteAcceptanceScreen() {
  const theme = colors.dark;
  const router = useRouter();
  const { code: initialCode } = useLocalSearchParams<{ code?: string }>();

  const { user } = useAuthStore();
  const [invitationCode, setInvitationCode] = useState(initialCode || '');
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch invitation details when code is provided
  const {
    data: invitation,
    isLoading: isLoadingInvitation,
    error: invitationError,
    refetch,
  } = useInvitationByCode(invitationCode.length >= 6 ? invitationCode : '');

  const acceptInvitation = useAcceptInvitation();

  const handleVerifyCode = useCallback(async () => {
    if (invitationCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid invitation code');
      return;
    }

    setIsVerifying(true);
    try {
      await refetch();
    } finally {
      setIsVerifying(false);
    }
  }, [invitationCode, refetch]);

  const handleAccept = useCallback(async () => {
    if (!invitation || !user?.id || !user?.email) return;

    try {
      await acceptInvitation.mutateAsync({
        code: invitationCode,
        userId: user.id,
        userEmail: user.email,
      });

      Alert.alert('Success', `You have joined ${invitation.fleet?.name || 'the fleet'}!`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to accept invitation');
    }
  }, [invitation, invitationCode, acceptInvitation, router, user]);

  const handleDecline = useCallback(() => {
    Alert.alert('Decline Invitation', 'Are you sure you want to decline this invitation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Join Fleet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Code Input Section */}
        {!invitation && (
          <View style={styles.codeSection}>
            <Text style={styles.emoji}>F</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Enter Invitation Code</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter the code you received from your fleet administrator
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                  borderColor: invitationError ? theme.error : theme.divider,
                },
              ]}
              value={invitationCode}
              onChangeText={setInvitationCode}
              placeholder="XXXX-XXXX"
              placeholderTextColor={theme.textDisabled}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={9}
            />

            {invitationError && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                Invalid or expired invitation code
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: theme.primary },
                (isVerifying || isLoadingInvitation) && styles.buttonDisabled,
              ]}
              onPress={handleVerifyCode}
              disabled={isVerifying || isLoadingInvitation}
            >
              {isVerifying || isLoadingInvitation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Invitation Details Section */}
        {invitation && (
          <View style={styles.invitationSection}>
            <View style={[styles.invitationCard, { backgroundColor: theme.card }]}>
              <View style={[styles.fleetIcon, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.fleetIconText, { color: theme.primary }]}>
                  {invitation.fleet?.name?.charAt(0) || 'F'}
                </Text>
              </View>

              <Text style={[styles.fleetName, { color: theme.textPrimary }]}>
                {invitation.fleet?.name}
              </Text>

              {invitation.fleet?.company_name && (
                <Text style={[styles.companyName, { color: theme.textSecondary }]}>
                  {invitation.fleet?.company_name}
                </Text>
              )}

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Your Role</Text>
                <View style={[styles.roleBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.roleBadgeText, { color: '#1E40AF' }]}>
                    {(invitation.role || 'Driver').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Invited By</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {invitation.inviter?.name || invitation.inviter?.email || 'Fleet Admin'}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  { backgroundColor: theme.success },
                  acceptInvitation.isPending && styles.buttonDisabled,
                ]}
                onPress={handleAccept}
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept Invitation</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.declineButton, { borderColor: theme.divider }]}
                onPress={handleDecline}
                disabled={acceptInvitation.isPending}
              >
                <Text style={[styles.declineButtonText, { color: theme.textSecondary }]}>
                  Decline
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  codeSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
    color: '#6B7280',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  codeInput: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  verifyButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  invitationSection: {
    flex: 1,
  },
  invitationCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  fleetIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fleetIconText: {
    fontSize: 32,
    fontWeight: '700',
  },
  fleetName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 15,
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  acceptButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
